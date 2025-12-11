import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsOptional, IsString, IsObject, IsBoolean } from 'class-validator';
import { EstadoAsignacion } from '@prisma/client';
import { CreateAsignacionDto } from './create-asignacion.dto';

export class UpdateAsignacionDto extends PartialType(CreateAsignacionDto) {
  @IsEnum(EstadoAsignacion)
  @IsOptional()
  estado?: EstadoAsignacion;

  @IsInt()
  @IsOptional()
  kmRetorno?: number;

  @IsString()
  @IsOptional()
  horaRetorno?: string;

  @IsObject()
  @IsOptional()
  checklist?: object;

  @IsObject()
  @IsOptional()
  niveles?: object;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @IsString()
  @IsOptional()
  firmaUsuario?: string;

  @IsString()
  @IsOptional()
  firmaEncargado?: string;

  @IsBoolean()
  @IsOptional()
  tieneDanos?: boolean;
}