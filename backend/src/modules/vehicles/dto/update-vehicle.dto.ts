import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { VehicleType } from '../../../schemas/vehicle.schema';

export class UpdateVehicleDto {
  @IsOptional()
  @IsEnum(['4', '7', '16', '29', '45'])
  type?: VehicleType;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
