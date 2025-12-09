export interface Vehiculo {
  id: number;
  placa: string;
  marca: string | null;
  modelo: string | null;
  tipo: string | null;
  kmActual: number;
  kmUltimoMantenimiento: number;
  fechaUltimoMantenimiento: Date | null;
}

export interface CreateVehiculoDto {
  placa: string;
  marca?: string;
  modelo?: string;
  tipo?: string;
  kmActual?: number;
  kmUltimoMantenimiento?: number;
  fechaUltimoMantenimiento?: Date;
}

export interface UpdateVehiculoDto {
  placa?: string;
  marca?: string;
  modelo?: string;
  tipo?: string;
  kmActual?: number;
  kmUltimoMantenimiento?: number;
  fechaUltimoMantenimiento?: Date;
}
