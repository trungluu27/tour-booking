import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tour, TourSchema } from '../../schemas/tour.schema';
import { Vehicle, VehicleSchema } from '../../schemas/vehicle.schema';
import { Booking, BookingSchema } from '../../schemas/booking.schema';
import { AuthModule } from '../auth/auth.module';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tour.name, schema: TourSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    AuthModule,
  ],
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService, MongooseModule],
})
export class ToursModule {}
