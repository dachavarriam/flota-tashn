import { api } from './client';
import type { Asignacion, CreateAsignacionDto, UpdateAsignacionDto } from '../types/asignacion';

export const asignacionesApi = {
  getAll: async (): Promise<Asignacion[]> => {
    const { data } = await api.get<Asignacion[]>('/asignaciones');
    return data;
  },

  getOne: async (id: number): Promise<Asignacion> => {
    const { data } = await api.get<Asignacion>(`/asignaciones/${id}`);
    return data;
  },

  create: async (payload: CreateAsignacionDto): Promise<Asignacion> => {
    const { data } = await api.post<Asignacion>('/asignaciones', payload);
    return data;
  },

  update: async (id: number, payload: UpdateAsignacionDto): Promise<Asignacion> => {
    const { data } = await api.patch<Asignacion>(`/asignaciones/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/asignaciones/${id}`);
  }
};
