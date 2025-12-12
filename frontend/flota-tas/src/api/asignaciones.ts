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
  },

  exportPdf: async (id: number): Promise<Blob> => {
    const { data } = await api.get(`/asignaciones/${id}/pdf`, {
      responseType: 'blob'
    });
    return data;
  },

  sendToSlack: async (id: number): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post(`/asignaciones/${id}/send-slack`);
    return data;
  }
};
