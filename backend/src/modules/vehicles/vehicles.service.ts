import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from '../../schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private readonly model: Model<VehicleDocument>,
  ) {}

  async list() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }

  async get(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Vehicle not found');
    const vehicle = await this.model.findById(id).lean().exec();
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(dto: CreateVehicleDto) {
    try {
      const doc = await this.model.create(dto);
      return doc.toObject();
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Biển số xe đã tồn tại');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateVehicleDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Vehicle not found');
    try {
      const doc = await this.model
        .findByIdAndUpdate(id, dto, { new: true })
        .lean()
        .exec();
      if (!doc) throw new NotFoundException('Vehicle not found');
      return doc;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Biển số xe đã tồn tại');
      }
      throw err;
    }
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Vehicle not found');
    const doc = await this.model.findByIdAndDelete(id).lean().exec();
    if (!doc) throw new NotFoundException('Vehicle not found');
    return { ok: true };
  }
}
