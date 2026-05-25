import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { VehicleType } from '../../../schemas/vehicle.schema';

export class CreateVehicleDto {
  @IsEnum(['4', '7', '16', '29', '45'])
  type!: VehicleType;

  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @IsString()
  @IsNotEmpty()
  driverName!: string;

  @IsString()
  @IsNotEmpty()
  driverPhone!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
