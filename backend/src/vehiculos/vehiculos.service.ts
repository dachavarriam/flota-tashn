import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehiculoDto) {
    // Verificar si la placa ya existe
    const exists = await this.prisma.vehiculo.findUnique({
      where: { placa: dto.placa }
    });

    if (exists) {
      throw new ConflictException(
        `Ya existe un vehículo con la placa ${dto.placa}`
      );
    }

    const vehiculo = await this.prisma.vehiculo.create({
      data: {
        placa: dto.placa,
        marca: dto.marca,
        modelo: dto.modelo,
        tipo: dto.tipo,
        kmActual: dto.kmActual ?? 0,
        kmUltimoMantenimiento: dto.kmUltimoMantenimiento ?? 0,
        fechaUltimoMantenimiento: dto.fechaUltimoMantenimiento
      }
    });

    return vehiculo;
  }

  async findAll() {
    return await this.prisma.vehiculo.findMany({
      orderBy: {
        id: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: {
        asignaciones: {
          take: 5,
          orderBy: {
            fecha: 'desc'
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                correo: true
              }
            },
            encargado: {
              select: {
                id: true,
                nombre: true,
                correo: true
              }
            }
          }
        }
      }
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return vehiculo;
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    // Verificar que el vehículo existe
    await this.findOne(id);

    // Si se intenta cambiar la placa, verificar que no exista
    if (dto.placa) {
      const exists = await this.prisma.vehiculo.findUnique({
        where: { placa: dto.placa }
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Ya existe otro vehículo con la placa ${dto.placa}`
        );
      }
    }

    const vehiculo = await this.prisma.vehiculo.update({
      where: { id },
      data: dto
    });

    return vehiculo;
  }

  async remove(id: number) {
    // Verificar que el vehículo existe
    await this.findOne(id);

    // Verificar si tiene asignaciones
    const asignacionesCount = await this.prisma.asignacion.count({
      where: { vehiculoId: id }
    });

    if (asignacionesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el vehículo porque tiene ${asignacionesCount} asignaciones registradas`
      );
    }

    await this.prisma.vehiculo.delete({
      where: { id }
    });

    return {
      message: 'Vehículo eliminado exitosamente',
      id
    };
  }
}
