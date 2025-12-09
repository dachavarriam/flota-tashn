import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength
} from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  @MinLength(3, { message: 'La placa debe tener al menos 3 caracteres' })
  placa!: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'El kilometraje actual no puede ser negativo' })
  kmActual?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'El kilometraje del último mantenimiento no puede ser negativo' })
  kmUltimoMantenimiento?: number;

  @IsOptional()
  fechaUltimoMantenimiento?: Date;
}
