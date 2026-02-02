import { api } from './client';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../types/usuario';

// TODO: Mover esta interfaz a un archivo de tipos compartido (ej. ../types/asignacion.ts)
export interface Asignacion {
  id: number;
  [key: string]: unknown; // Permite propiedades adicionales de forma segura hasta definir el tipo completo
}

export const usuariosApi = {
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>('/usuarios');
    return data;
  },

  getOne: async (id: number): Promise<Usuario> => {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`);
    return data;
  },

  create: async (payload: CreateUsuarioDto): Promise<Usuario> => {
    const { data } = await api.post<Usuario>('/usuarios', payload);
    return data;
  },

  update: async (id: number, payload: UpdateUsuarioDto): Promise<Usuario> => {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<Usuario> => {
    const { data } = await api.delete<Usuario>(`/usuarios/${id}`);
    return data;
  },

  getAsignaciones: async (id: number): Promise<{recibidas: Asignacion[], asignadas: Asignacion[]}> => {
    const { data } = await api.get(`/usuarios/${id}/asignaciones`);
    return data;
  }
};