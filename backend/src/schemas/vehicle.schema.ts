import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleType = '4' | '7' | '16' | '29' | '45';

export const VEHICLE_CAPACITY: Record<VehicleType, number> = {
  '4': 4,
  '7': 7,
  '16': 16,
  '29': 29,
  '45': 45,
};

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true, enum: ['4', '7', '16', '29', '45'] })
  type!: VehicleType;

  @Prop({ required: true, trim: true })
  licensePlate!: string;

  @Prop({ required: true, trim: true })
  driverName!: string;

  @Prop({ required: true, trim: true })
  driverPhone!: string;

  @Prop({ trim: true })
  note?: string;
}

export type VehicleDocument = Vehicle & Document;
export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
VehicleSchema.index({ licensePlate: 1 }, { unique: true });
