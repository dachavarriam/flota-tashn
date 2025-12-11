import { IsInt, IsOptional, IsString, IsObject, IsArray } from 'class-validator';

export class CreateAsignacionDto {
  @IsInt()
  vehiculoId!: number;

  @IsInt()
  usuarioId!: number;

  @IsInt()
  encargadoId!: number;

  @IsInt()
  kmSalida!: number;

  @IsString()
  @IsOptional()
  uso?: string;

  @IsObject()
  @IsOptional()
  checklist?: object;

  @IsObject()
  @IsOptional()
  niveles?: object;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsArray()
  @IsOptional()
  fotos?: { tipo: string; url: string }[];
}
