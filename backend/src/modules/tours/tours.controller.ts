import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { AssignVehiclesDto, CreateRouteDto, UpdateRouteDto } from './dto/route.dto';
import { ToursService } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly service: ToursService) {}

  @Get('public')
  listPublic(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.service.listPublic(Number.isFinite(n) ? (n as number) : undefined);
  }

  @Get('slug/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.service.list();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTourDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTourDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/lock')
  @UseGuards(JwtAuthGuard)
  lock(@Param('id') id: string, @Body('locked') locked: boolean) {
    return this.service.setLock(id, Boolean(locked));
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  close(@Param('id') id: string) {
    return this.service.close(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/routes')
  @UseGuards(JwtAuthGuard)
  addRoute(@Param('id') id: string, @Body() dto: CreateRouteDto) {
    return this.service.addRoute(id, dto);
  }

  @Put(':id/routes/:routeId')
  @UseGuards(JwtAuthGuard)
  updateRoute(
    @Param('id') id: string,
    @Param('routeId') routeId: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.service.updateRoute(id, routeId, dto);
  }

  @Put(':id/routes/:routeId/vehicles')
  @UseGuards(JwtAuthGuard)
  assignVehicles(
    @Param('id') id: string,
    @Param('routeId') routeId: string,
    @Body() dto: AssignVehiclesDto,
  ) {
    return this.service.assignVehicles(id, routeId, dto);
  }

  @Delete(':id/routes/:routeId')
  @UseGuards(JwtAuthGuard)
  deleteRoute(@Param('id') id: string, @Param('routeId') routeId: string) {
    return this.service.deleteRoute(id, routeId);
  }
}
