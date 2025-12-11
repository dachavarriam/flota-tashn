export interface Vehiculo {
  id: number;
  placa: string;
  marca: string | null;
  modelo: string | null;
  tipo: string | null;
  kmActual: number;
  kmUltimoMantenimiento: number;
  fechaUltimoMantenimiento: Date | null;
  disponible?: boolean;
  asignacionActiva?: {
    id: number;
    estado: string;
    usuario: {
      nombre: string;
    };
  } | null;
  asignaciones?: any[]; // For backend compatibility
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
