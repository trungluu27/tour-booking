import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post('tours/slug/:slug/bookings')
  createPublic(@Param('slug') slug: string, @Body() dto: CreateBookingDto) {
    return this.service.createForSlug(slug, dto);
  }

  @Get('tours/:tourId/bookings')
  @UseGuards(JwtAuthGuard)
  list(
    @Param('tourId') tourId: string,
    @Query('routeId') routeId?: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.service.listByTour(tourId, { routeId, vehicleId });
  }

  @Get('tours/:tourId/bookings/export')
  @UseGuards(JwtAuthGuard)
  async export(
    @Param('tourId') tourId: string,
    @Res() res: Response,
    @Query('routeId') routeId?: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    const { buffer, filename } = await this.service.exportByTour(tourId, {
      routeId,
      vehicleId,
    });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  }

  @Delete('bookings/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
