import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitize(user: any) {
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUsuarioDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo,
        password: hashed,
        rol: dto.rol,
        activo: dto.activo ?? true
      }
    });
    return this.sanitize(user);
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany();
    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.sanitize(user);
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const existing = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check email uniqueness if being updated
    if (dto.correo && dto.correo !== existing.correo) {
      const emailExists = await this.prisma.usuario.findUnique({
        where: { correo: dto.correo }
      });
      if (emailExists) {
        throw new ConflictException('El correo ya está en uso');
      }
    }

    const data: any = { ...dto };

    // Hash password if provided
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data
    });

    return this.sanitize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check if user has asignaciones
    const asignacionesRecibidas = await this.prisma.asignacion.count({
      where: { usuarioId: id }
    });

    const asignacionesAsignadas = await this.prisma.asignacion.count({
      where: { encargadoId: id }
    });

    if (asignacionesRecibidas > 0 || asignacionesAsignadas > 0) {
      // Deactivate instead of delete
      const deactivated = await this.prisma.usuario.update({
        where: { id },
        data: { activo: false }
      });
      return this.sanitize(deactivated);
    }

    // Safe to delete if no asignaciones
    const deleted = await this.prisma.usuario.delete({ where: { id } });
    return this.sanitize(deleted);
  }

  async getAsignaciones(id: number) {
    // Verify user exists
    await this.findOne(id);

    // Get asignaciones where user is the conductor or encargado
    const asignacionesRecibidas = await this.prisma.asignacion.findMany({
      where: { usuarioId: id },
      include: {
        vehiculo: true,
        encargado: {
          select: {
            id: true,
            nombre: true,
            correo: true
          }
        },
        fotos: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    const asignacionesAsignadas = await this.prisma.asignacion.findMany({
      where: { encargadoId: id },
      include: {
        vehiculo: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true
          }
        },
        fotos: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return {
      recibidas: asignacionesRecibidas,
      asignadas: asignacionesAsignadas
    };
  }
}
