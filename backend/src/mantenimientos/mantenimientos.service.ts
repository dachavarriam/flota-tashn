import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';

@Injectable()
export class MantenimientosService {
  // Mantenimientos Service Methods
  constructor(private prisma: PrismaService) {}

  async create(createMantenimientoDto: CreateMantenimientoDto) {
    const { vehiculoId, ...data } = createMantenimientoDto;

    // Verify vehicle exists
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId }
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${vehiculoId} no encontrado`);
    }

    // Validate kmActual is greater than or equal to current vehicle km
    if (data.kmActual < vehiculo.kmActual) {
      throw new BadRequestException(
        `El kilometraje del mantenimiento (${data.kmActual}) no puede ser menor al kilometraje actual del vehículo (${vehiculo.kmActual})`
      );
    }

    // Create mantenimiento
    const mantenimiento = await this.prisma.mantenimiento.create({
      data: {
        vehiculoId,
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : new Date()
      },
      include: {
        vehiculo: true
      }
    });

    // Update vehicle's last maintenance info
    await this.prisma.vehiculo.update({
      where: { id: vehiculoId },
      data: {
        kmActual: data.kmActual,
        kmUltimoMantenimiento: data.kmActual,
        fechaUltimoMantenimiento: mantenimiento.fecha
      }
    });

    return mantenimiento;
  }

  async findAll() {
    return this.prisma.mantenimiento.findMany({
      include: {
        vehiculo: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });
  }

  async findByVehiculo(vehiculoId: number) {
    return this.prisma.mantenimiento.findMany({
      where: { vehiculoId },
      include: {
        vehiculo: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const mantenimiento = await this.prisma.mantenimiento.findUnique({
      where: { id },
      include: {
        vehiculo: true
      }
    });

    if (!mantenimiento) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }

    return mantenimiento;
  }

  async update(id: number, updateMantenimientoDto: UpdateMantenimientoDto) {
    // Verify mantenimiento exists
    const existing = await this.findOne(id);

    const { vehiculoId, ...data } = updateMantenimientoDto;

    // If changing vehicle, verify new vehicle exists
    if (vehiculoId && vehiculoId !== existing.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: vehiculoId }
      });

      if (!vehiculo) {
        throw new NotFoundException(`Vehículo con ID ${vehiculoId} no encontrado`);
      }
    }

    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        ...(vehiculoId && { vehiculoId }),
        ...data,
        ...(data.fecha && { fecha: new Date(data.fecha) })
      },
      include: {
        vehiculo: true
      }
    });
  }

  async remove(id: number) {
    // Verify exists
    await this.findOne(id);

    return this.prisma.mantenimiento.delete({
      where: { id },
      include: {
        vehiculo: true
      }
    });
  }
}