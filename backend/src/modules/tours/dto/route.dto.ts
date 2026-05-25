import {
  IsArray,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleSlotInputDto {
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @IsMongoId()
  vehicle!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleSlotInputDto)
  vehicleSlots?: VehicleSlotInputDto[];
}

export class UpdateRouteDto extends CreateRouteDto {}

export class AssignVehiclesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleSlotInputDto)
  vehicleSlots!: VehicleSlotInputDto[];
}
