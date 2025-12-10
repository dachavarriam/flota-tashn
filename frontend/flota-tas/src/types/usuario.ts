export enum Rol {
  USUARIO = 'USUARIO',
  ENCARGADO = 'ENCARGADO',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
  SUPERUSER = 'SUPERUSER'
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface CreateUsuarioDto {
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
  activo?: boolean;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  correo?: string;
  password?: string;
  rol?: Rol;
  activo?: boolean;
}
