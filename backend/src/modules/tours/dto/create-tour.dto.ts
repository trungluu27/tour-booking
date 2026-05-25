import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTourDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;
}
