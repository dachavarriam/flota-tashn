import { Rol } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  correo: string;
  rol: Rol;
}
