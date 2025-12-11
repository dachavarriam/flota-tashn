import type { Usuario } from './usuario';
import type { Vehiculo } from './vehiculo';

export const EstadoAsignacion = {
  ACTIVA: 'ACTIVA',
  EN_REVISION: 'EN_REVISION',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA'
} as const;

export type EstadoAsignacion = typeof EstadoAsignacion[keyof typeof EstadoAsignacion];

export interface FotoAsignacion {
  id: number;
  asignacionId: number;
  tipo: string;
  url: string;
}

export interface Asignacion {
  id: number;
  numeroRegistro?: string;
  vehiculoId: number;
  usuarioId: number;
  encargadoId: number;
  fecha: string; // ISO Date string
  horaSalida?: string;
  horaRetorno?: string;
  kmSalida?: number;
  kmRetorno?: number;
  uso?: string;
  estado: EstadoAsignacion;
  checklist?: Record<string, any>; // JSON
  niveles?: Record<string, any>; // JSON
  observaciones?: string;
  pdfUrl?: string;
  firmaUsuario?: string;
  firmaEncargado?: string;
  tieneDanos?: boolean;

  vehiculo?: Vehiculo;
  usuario?: Usuario;
  encargado?: Usuario;
  fotos?: FotoAsignacion[];
}

export interface CreateAsignacionDto {
  vehiculoId: number;
  usuarioId: number;
  encargadoId: number;
  kmSalida?: number;
  uso?: string;
  checklist?: Record<string, any>;
  niveles?: Record<string, any>;
  observaciones?: string;
  fotos?: { tipo: string; url: string }[];
}

export interface UpdateAsignacionDto {
  estado?: EstadoAsignacion;
  kmRetorno?: number;
  horaRetorno?: string;
  checklist?: Record<string, any>;
  niveles?: Record<string, any>;
  observaciones?: string;
  pdfUrl?: string;
  firmaUsuario?: string;
  firmaEncargado?: string;
  tieneDanos?: boolean;
}
