import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsEnum(['active', 'closed'])
  status?: 'active' | 'closed';
}
