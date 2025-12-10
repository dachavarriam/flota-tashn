import type { Usuario } from './usuario';
import type { Vehiculo } from './vehiculo';

export enum EstadoAsignacion {
  ACTIVA = 'ACTIVA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

export interface FotoAsignacion {
  id: number;
  asignacionId: number;
  tipo: string;
  url: string;
}

export interface Asignacion {
  id: number;
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
}
