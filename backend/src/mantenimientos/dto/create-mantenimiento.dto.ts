import { IsInt, IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateMantenimientoDto {
  @IsInt()
  vehiculoId!: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  tipo!: string;

  @IsString()
  descripcion!: string;

  @IsString()
  @IsOptional()
  taller?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costo?: number;

  @IsInt()
  @Min(0)
  kmActual!: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  proximoMantenimiento?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
