import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class VehicleSlot {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  capacity!: number;

  @Prop({ required: true, default: 0, min: 0 })
  booked!: number;
}

export const VehicleSlotSchema = SchemaFactory.createForClass(VehicleSlot);

@Schema({ _id: true, timestamps: true })
export class Route {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Date })
  departureTime?: Date;

  @Prop({ type: [VehicleSlotSchema], default: [] })
  vehicleSlots!: VehicleSlot[];
}

export const RouteSchema = SchemaFactory.createForClass(Route);

export type TourStatus = 'active' | 'closed';

@Schema({ timestamps: true })
export class Tour {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  backgroundImage?: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  slug!: string;

  @Prop({ default: false })
  locked!: boolean;

  @Prop({ required: true, enum: ['active', 'closed'], default: 'active' })
  status!: TourStatus;

  @Prop({ type: [RouteSchema], default: [] })
  routes!: Route[];
}

export type TourDocument = Tour & Document;
export const TourSchema = SchemaFactory.createForClass(Tour);
