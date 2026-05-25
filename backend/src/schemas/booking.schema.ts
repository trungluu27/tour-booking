import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Tour', required: true, index: true })
  tour!: Types.ObjectId;

  @Prop({ required: true })
  tourSlug!: string;

  @Prop({ type: Types.ObjectId, required: true })
  routeId!: Types.ObjectId;

  @Prop({ required: true })
  routeName!: string;

  @Prop({ type: Types.ObjectId, required: true })
  vehicleSlotId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId!: Types.ObjectId;

  @Prop({ required: true })
  vehicleType!: string;

  @Prop({ required: true })
  vehiclePlate!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  note?: string;
}

export type BookingDocument = Booking & Document;
export const BookingSchema = SchemaFactory.createForClass(Booking);
