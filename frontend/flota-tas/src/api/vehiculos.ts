import { api } from './client';
import type { Vehiculo, CreateVehiculoDto, UpdateVehiculoDto } from '../types/vehiculo';

export const vehiculosApi = {
  getAll: async (): Promise<Vehiculo[]> => {
    const { data } = await api.get<Vehiculo[]>('/vehiculos');
    return data;
  },

  getOne: async (id: number): Promise<Vehiculo> => {
    const { data } = await api.get<Vehiculo>(`/vehiculos/${id}`);
    return data;
  },

  getHistorial: async (id: number): Promise<any[]> => {
    const { data } = await api.get<any[]>(`/vehiculos/${id}/historial`);
    return data;
  },

  create: async (payload: CreateVehiculoDto): Promise<Vehiculo> => {
    const { data } = await api.post<Vehiculo>('/vehiculos', payload);
    return data;
  },

  update: async (id: number, payload: UpdateVehiculoDto): Promise<Vehiculo> => {
    const { data } = await api.patch<Vehiculo>(`/vehiculos/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/vehiculos/${id}`);
  }
};
