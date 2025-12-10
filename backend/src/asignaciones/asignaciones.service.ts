import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(private prisma: PrismaService) {}

  async create(createAsignacionDto: CreateAsignacionDto) {
    const { vehiculoId, usuarioId, encargadoId, fotos, ...data } = createAsignacionDto;

    // Verify existence of related entities
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehículo con ID ${vehiculoId} no encontrado`);

    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);

    const encargado = await this.prisma.usuario.findUnique({ where: { id: encargadoId } });
    if (!encargado) throw new NotFoundException(`Encargado con ID ${encargadoId} no encontrado`);

    // Create assignment
    return this.prisma.asignacion.create({
      data: {
        ...data,
        vehiculoId,
        usuarioId,
        encargadoId,
        fotos: fotos?.length
          ? {
              create: fotos.map((f) => ({ tipo: f.tipo, url: f.url })),
            }
          : undefined,
      },
      include: {
        vehiculo: true,
        usuario: true,
        encargado: true,
        fotos: true,
      },
    });
  }

  async findAll() {
    return this.prisma.asignacion.findMany({
      include: {
        vehiculo: true,
        usuario: true,
        encargado: true,
        fotos: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const asignacion = await this.prisma.asignacion.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        usuario: true,
        encargado: true,
        fotos: true,
      },
    });

    if (!asignacion) throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    return asignacion;
  }

  async update(id: number, updateAsignacionDto: UpdateAsignacionDto) {
    await this.findOne(id); // Verify existence

    const { fotos, ...data } = updateAsignacionDto;

    // Logic for updating photos could be complex (add/remove), 
    // for now we only support adding new ones via update if "fotos" is passed, 
    // or we ignore it. Let's assume we ignore "fotos" in update for simplicity 
    // unless we specifically want to replace them. 
    // A better approach for photos is separate endpoints or specific logic.
    // For now, I'll strip 'fotos' from update to avoid issues, 
    // as UpdateAsignacionDto extends Create which has it.

    return this.prisma.asignacion.update({
      where: { id },
      data: {
        ...data,
        // If we want to add photos during update, we would use:
        // fotos: fotos ? { create: fotos... } : undefined
        // But usually updates to assignments are status/checklist updates.
      },
      include: {
        vehiculo: true,
        usuario: true,
        encargado: true,
        fotos: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verify existence

    // Manually delete photos first if cascade isn't set in DB
    // Or try delete and see. 
    // To be safe and explicit:
    await this.prisma.fotoAsignacion.deleteMany({ where: { asignacionId: id } });

    return this.prisma.asignacion.delete({
      where: { id },
    });
  }
}