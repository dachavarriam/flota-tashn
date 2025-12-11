import type { Vehiculo } from './vehiculo';

export interface Mantenimiento {
  id: number;
  vehiculoId: number;
  fecha: Date | string;
  tipo: string;
  descripcion: string;
  taller?: string | null;
  costo?: number | null;
  kmActual: number;
  proximoMantenimiento?: number | null;
  observaciones?: string | null;
  vehiculo?: Vehiculo;
}

export interface CreateMantenimientoDto {
  vehiculoId: number;
  fecha?: string;
  tipo: string;
  descripcion: string;
  taller?: string;
  costo?: number;
  kmActual: number;
  proximoMantenimiento?: number;
  observaciones?: string;
}

export interface UpdateMantenimientoDto extends Partial<CreateMantenimientoDto> {}
