import { api } from './client';
import type { Mantenimiento, CreateMantenimientoDto, UpdateMantenimientoDto } from '../types/mantenimiento';

export const mantenimientosApi = {
  getAll: async (): Promise<Mantenimiento[]> => {
    const { data } = await api.get<Mantenimiento[]>('/mantenimientos');
    return data;
  },

  getByVehiculo: async (vehiculoId: number): Promise<Mantenimiento[]> => {
    const { data } = await api.get<Mantenimiento[]>(`/mantenimientos?vehiculoId=${vehiculoId}`);
    return data;
  },

  getOne: async (id: number): Promise<Mantenimiento> => {
    const { data } = await api.get<Mantenimiento>(`/mantenimientos/${id}`);
    return data;
  },

  create: async (payload: CreateMantenimientoDto): Promise<Mantenimiento> => {
    const { data } = await api.post<Mantenimiento>('/mantenimientos', payload);
    return data;
  },

  update: async (id: number, payload: UpdateMantenimientoDto): Promise<Mantenimiento> => {
    const { data } = await api.patch<Mantenimiento>(`/mantenimientos/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/mantenimientos/${id}`);
  }
};
