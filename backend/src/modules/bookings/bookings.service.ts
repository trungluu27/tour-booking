import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';

import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { Tour, TourDocument } from '../../schemas/tour.schema';
import { Vehicle, VehicleDocument } from '../../schemas/vehicle.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

export interface BookingFilter {
  routeId?: string;
  vehicleId?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Tour.name) private readonly tourModel: Model<TourDocument>,
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async createForSlug(slug: string, dto: CreateBookingDto) {
    const tour = await this.tourModel.findOne({ slug }).lean().exec();
    if (!tour) throw new NotFoundException('Tour không tồn tại');
    if (tour.status === 'closed') {
      throw new ForbiddenException('Tour đã đóng đăng ký');
    }
    if (tour.locked) {
      throw new ForbiddenException('Tour đã khoá form đăng ký');
    }

    const route = tour.routes?.find((r) => r._id.toString() === dto.routeId);
    if (!route) throw new NotFoundException('Tuyến không tồn tại');
    const slot = route.vehicleSlots?.find(
      (s) => s._id.toString() === dto.vehicleSlotId,
    );
    if (!slot) throw new NotFoundException('Xe không tồn tại trong tuyến');

    const vehicle = await this.vehicleModel.findById(slot.vehicle).lean().exec();
    if (!vehicle) throw new NotFoundException('Xe không tồn tại');

    const capacity = slot.capacity;
    const updated = await this.tourModel
      .findOneAndUpdate(
        {
          _id: tour._id,
          locked: false,
          status: 'active',
          routes: {
            $elemMatch: {
              _id: new Types.ObjectId(dto.routeId),
              vehicleSlots: {
                $elemMatch: {
                  _id: new Types.ObjectId(dto.vehicleSlotId),
                  booked: { $lt: capacity },
                },
              },
            },
          },
        },
        { $inc: { 'routes.$[r].vehicleSlots.$[s].booked': 1 } },
        {
          arrayFilters: [
            { 'r._id': new Types.ObjectId(dto.routeId) },
            { 's._id': new Types.ObjectId(dto.vehicleSlotId) },
          ],
          new: true,
        },
      )
      .exec();

    if (!updated) {
      throw new ConflictException('Xe đã hết chỗ, vui lòng chọn xe khác');
    }

    const booking = await this.bookingModel.create({
      tour: tour._id,
      tourSlug: tour.slug,
      routeId: new Types.ObjectId(dto.routeId),
      routeName: route.name,
      vehicleSlotId: new Types.ObjectId(dto.vehicleSlotId),
      vehicleId: vehicle._id,
      vehicleType: vehicle.type,
      vehiclePlate: vehicle.licensePlate,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      note: dto.note,
    });

    await this.maybeAutoLock(tour._id.toString());

    return {
      id: booking._id.toString(),
      tourTitle: tour.title,
      routeName: route.name,
      vehicleType: vehicle.type,
      vehiclePlate: vehicle.licensePlate,
    };
  }

  async listByTour(tourId: string, filter: BookingFilter = {}) {
    if (!Types.ObjectId.isValid(tourId)) throw new NotFoundException('Tour not found');
    const query: Record<string, unknown> = { tour: new Types.ObjectId(tourId) };
    if (filter.routeId && Types.ObjectId.isValid(filter.routeId)) {
      query.routeId = new Types.ObjectId(filter.routeId);
    }
    if (filter.vehicleId && Types.ObjectId.isValid(filter.vehicleId)) {
      query.vehicleId = new Types.ObjectId(filter.vehicleId);
    }
    return this.bookingModel.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  async exportByTour(tourId: string, filter: BookingFilter = {}) {
    if (!Types.ObjectId.isValid(tourId)) throw new NotFoundException('Tour not found');
    const tour = await this.tourModel.findById(tourId).lean().exec();
    if (!tour) throw new NotFoundException('Tour not found');

    const bookings = await this.listByTour(tourId, filter);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tour Booking';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Bookings', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: 'STT', key: 'idx', width: 6 },
      { header: 'Thời gian đăng ký', key: 'createdAt', width: 20 },
      { header: 'Họ tên', key: 'fullName', width: 24 },
      { header: 'SĐT', key: 'phone', width: 16 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Tuyến', key: 'routeName', width: 24 },
      { header: 'Biển số xe', key: 'vehiclePlate', width: 14 },
      { header: 'Loại xe', key: 'vehicleType', width: 10 },
      { header: 'Ghi chú', key: 'note', width: 30 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' },
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'left' };
    sheet.getRow(1).height = 22;

    bookings.forEach((b: any, idx) => {
      const created = b.createdAt
        ? new Date(b.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      sheet.addRow({
        idx: idx + 1,
        createdAt: created,
        fullName: b.fullName,
        phone: b.phone,
        email: b.email ?? '',
        routeName: b.routeName,
        vehiclePlate: b.vehiclePlate,
        vehicleType: `${b.vehicleType} chỗ`,
        note: b.note ?? '',
      });
    });

    sheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    const buffer = Buffer.from(
      (await workbook.xlsx.writeBuffer()) as ArrayBuffer,
    );
    const safeTitle = (tour.title || 'tour')
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .slice(0, 40);
    const filename = `bookings_${safeTitle}_${Date.now()}.xlsx`;
    return { buffer, filename };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Booking not found');
    const booking = await this.bookingModel.findById(id).lean().exec();
    if (!booking) throw new NotFoundException('Booking not found');

    await this.tourModel
      .findOneAndUpdate(
        { _id: booking.tour },
        { $inc: { 'routes.$[r].vehicleSlots.$[s].booked': -1 } },
        {
          arrayFilters: [
            { 'r._id': booking.routeId },
            { 's._id': booking.vehicleSlotId },
          ],
        },
      )
      .exec();

    await this.bookingModel.findByIdAndDelete(id).exec();
    return { ok: true };
  }

  private async maybeAutoLock(tourId: string) {
    const tour = await this.tourModel.findById(tourId).lean().exec();
    if (!tour || tour.locked) return;
    let totalCapacity = 0;
    let totalBooked = 0;
    for (const route of tour.routes ?? []) {
      for (const slot of route.vehicleSlots ?? []) {
        totalCapacity += slot.capacity;
        totalBooked += slot.booked;
      }
    }
    if (totalCapacity > 0 && totalBooked >= totalCapacity) {
      await this.tourModel.findByIdAndUpdate(tourId, { locked: true }).exec();
    }
  }
}
