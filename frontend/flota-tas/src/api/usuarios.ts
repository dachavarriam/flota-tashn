import { api } from './client';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../types/usuario';

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
  }
};