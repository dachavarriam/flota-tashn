import { api } from './client';

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: Usuario;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
};
