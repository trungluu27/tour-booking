import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { promises as fs } from 'fs';
import { join } from 'path';

import { Tour, TourDocument } from '../../schemas/tour.schema';
import { Vehicle, VehicleDocument, VEHICLE_CAPACITY } from '../../schemas/vehicle.schema';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { slugify, uniqueSuffix } from '../../common/slug.util';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { AssignVehiclesDto, CreateRouteDto, UpdateRouteDto } from './dto/route.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectModel(Tour.name) private readonly tourModel: Model<TourDocument>,
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async list() {
    return this.tourModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async listPublic(limit?: number) {
    const cap = Math.max(1, Math.min(limit ?? 12, 24));
    const tours = await this.tourModel
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean()
      .exec();

    return tours.map((tour) => {
      let totalCapacity = 0;
      let totalBooked = 0;
      let earliestDeparture: Date | null = null;
      for (const route of tour.routes ?? []) {
        if (route.departureTime) {
          const dt = new Date(route.departureTime as unknown as string);
          if (!earliestDeparture || dt < earliestDeparture) earliestDeparture = dt;
        }
        for (const slot of route.vehicleSlots ?? []) {
          totalCapacity += slot.capacity;
          totalBooked += slot.booked;
        }
      }
      return {
        _id: tour._id,
        title: tour.title,
        description: tour.description,
        backgroundImage: tour.backgroundImage,
        slug: tour.slug,
        locked: tour.locked,
        routeCount: (tour.routes ?? []).length,
        totalCapacity,
        totalBooked,
        seatsLeft: Math.max(0, totalCapacity - totalBooked),
        earliestDeparture,
      };
    });
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Tour not found');
    const tour = await this.tourModel.findById(id).lean().exec();
    if (!tour) throw new NotFoundException('Tour not found');
    return this.enrichTour(tour);
  }

  async getBySlug(slug: string) {
    const tour = await this.tourModel.findOne({ slug }).lean().exec();
    if (!tour) throw new NotFoundException('Tour not found');
    if (tour.status === 'closed') {
      throw new ForbiddenException('Tour đã đóng');
    }
    return this.enrichTour(tour);
  }

  async create(dto: CreateTourDto) {
    const slug = await this.buildUniqueSlug(dto.title);
    const doc = await this.tourModel.create({ ...dto, slug });
    return doc.toObject();
  }

  async update(id: string, dto: UpdateTourDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Tour not found');
    const update: Record<string, unknown> = { ...dto };
    if (dto.title) {
      const current = await this.tourModel.findById(id).lean().exec();
      if (!current) throw new NotFoundException('Tour not found');
      if (current.title !== dto.title) {
        update.slug = await this.buildUniqueSlug(dto.title, id);
      }
    }
    const doc = await this.tourModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Tour not found');
    return doc;
  }

  async setLock(id: string, locked: boolean) {
    return this.update(id, { locked });
  }

  async close(id: string) {
    return this.update(id, { status: 'closed' });
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Tour not found');
    const tour = await this.tourModel.findById(id).lean().exec();
    if (!tour) throw new NotFoundException('Tour not found');

    if (tour.backgroundImage) {
      await this.removeUploadedFile(tour.backgroundImage);
    }

    await this.bookingModel.deleteMany({ tour: tour._id }).exec();
    await this.tourModel.findByIdAndDelete(id).exec();
    return { ok: true };
  }

  async addRoute(tourId: string, dto: CreateRouteDto) {
    if (!Types.ObjectId.isValid(tourId)) throw new NotFoundException('Tour not found');
    const slots = await this.buildSlots(dto.vehicleSlots ?? []);

    const route = {
      _id: new Types.ObjectId(),
      name: dto.name,
      description: dto.description,
      departureTime: dto.departureTime ? new Date(dto.departureTime) : undefined,
      vehicleSlots: slots,
    };

    const updated = await this.tourModel
      .findByIdAndUpdate(tourId, { $push: { routes: route } }, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Tour not found');
    return updated;
  }

  async updateRoute(tourId: string, routeId: string, dto: UpdateRouteDto) {
    if (!Types.ObjectId.isValid(tourId) || !Types.ObjectId.isValid(routeId)) {
      throw new NotFoundException('Route not found');
    }
    const tour = await this.tourModel.findById(tourId).exec();
    if (!tour) throw new NotFoundException('Tour not found');
    const route = tour.routes.find((r) => r._id.toString() === routeId);
    if (!route) throw new NotFoundException('Route not found');

    if (dto.name !== undefined) route.name = dto.name;
    if (dto.description !== undefined) route.description = dto.description;
    if (dto.departureTime !== undefined) route.departureTime = new Date(dto.departureTime);

    if (dto.vehicleSlots) {
      const newSlots = await this.buildSlots(dto.vehicleSlots, route.vehicleSlots);
      route.vehicleSlots = newSlots;
    }

    await tour.save();
    return tour.toObject();
  }

  async assignVehicles(tourId: string, routeId: string, dto: AssignVehiclesDto) {
    return this.updateRoute(tourId, routeId, { vehicleSlots: dto.vehicleSlots } as UpdateRouteDto);
  }

  async deleteRoute(tourId: string, routeId: string) {
    if (!Types.ObjectId.isValid(tourId) || !Types.ObjectId.isValid(routeId)) {
      throw new NotFoundException('Route not found');
    }
    const tour = await this.tourModel
      .findByIdAndUpdate(
        tourId,
        { $pull: { routes: { _id: new Types.ObjectId(routeId) } } },
        { new: true },
      )
      .lean()
      .exec();
    if (!tour) throw new NotFoundException('Tour not found');
    await this.bookingModel
      .deleteMany({ tour: new Types.ObjectId(tourId), routeId: new Types.ObjectId(routeId) })
      .exec();
    return tour;
  }

  private async buildSlots(
    inputs: Array<{ _id?: string; vehicle: string; capacity: number }>,
    existing?: Array<{ _id: Types.ObjectId; vehicle: Types.ObjectId; capacity: number; booked: number }>,
  ) {
    const vehicleIds = inputs.map((s) => new Types.ObjectId(s.vehicle));
    const vehicles = await this.vehicleModel
      .find({ _id: { $in: vehicleIds } })
      .lean()
      .exec();
    const vehicleMap = new Map(vehicles.map((v) => [String(v._id), v]));

    return inputs.map((slot) => {
      const vehicle = vehicleMap.get(slot.vehicle);
      if (!vehicle) {
        throw new BadRequestException(`Xe ${slot.vehicle} không tồn tại`);
      }
      const maxCapacity = VEHICLE_CAPACITY[vehicle.type];
      if (slot.capacity > maxCapacity) {
        throw new BadRequestException(
          `Sức chứa xe ${vehicle.licensePlate} (${vehicle.type} chỗ) tối đa ${maxCapacity}`,
        );
      }

      let existingSlot;
      if (slot._id && existing) {
        existingSlot = existing.find((s) => s._id.toString() === slot._id);
      }

      return {
        _id: existingSlot?._id ?? new Types.ObjectId(),
        vehicle: new Types.ObjectId(slot.vehicle),
        capacity: slot.capacity,
        booked: existingSlot?.booked ?? 0,
      };
    });
  }

  private async buildUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || 'tour';
    let candidate = base;
    let attempt = 0;
    while (attempt < 5) {
      const query: Record<string, unknown> = { slug: candidate };
      if (excludeId) query._id = { $ne: new Types.ObjectId(excludeId) };
      const exists = await this.tourModel.exists(query).exec();
      if (!exists) return candidate;
      candidate = `${base}-${uniqueSuffix()}`;
      attempt += 1;
    }
    throw new ConflictException('Không thể tạo slug duy nhất, vui lòng đổi tiêu đề');
  }

  private async removeUploadedFile(url: string) {
    const marker = '/static/uploads/';
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const filename = url.slice(idx + marker.length);
    if (!filename || filename.includes('..') || filename.includes('/')) return;
    const filePath = join(process.cwd(), 'uploads', filename);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // ignore missing file
    }
  }

  private async enrichTour(tour: any) {
    const slotVehicleIds = new Set<string>();
    for (const route of tour.routes ?? []) {
      for (const slot of route.vehicleSlots ?? []) {
        if (slot?.vehicle) slotVehicleIds.add(String(slot.vehicle));
      }
    }
    if (slotVehicleIds.size === 0) return tour;
    const vehicles = await this.vehicleModel
      .find({ _id: { $in: Array.from(slotVehicleIds) } })
      .lean()
      .exec();
    const vehicleMap = new Map(vehicles.map((v) => [String(v._id), v]));

    tour.routes = (tour.routes ?? []).map((route: any) => ({
      ...route,
      vehicleSlots: (route.vehicleSlots ?? []).map((slot: any) => ({
        ...slot,
        vehicleInfo: vehicleMap.get(String(slot.vehicle)) ?? null,
      })),
    }));
    return tour;
  }
}
