import { api } from './client';
import type { Vehiculo, CreateVehiculoDto, UpdateVehiculoDto } from '../types/vehiculo';

export const vehiculosApi = {
  getAll: async (): Promise<Vehiculo[]> => {
    const response = await api.get<Vehiculo[]>('/vehiculos');
    return response.data;
  },

  getOne: async (id: number): Promise<Vehiculo> => {
    const response = await api.get<Vehiculo>(`/vehiculos/${id}`);
    return response.data;
  },

  create: async (data: CreateVehiculoDto): Promise<Vehiculo> => {
    const response = await api.post<Vehiculo>('/vehiculos', data);
    return response.data;
  },

  update: async (id: number, data: UpdateVehiculoDto): Promise<Vehiculo> => {
    const response = await api.patch<Vehiculo>(`/vehiculos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/vehiculos/${id}`);
  }
};
