import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(private prisma: PrismaService) {}

  private async generateNumeroRegistro(): Promise<string> {
    // Get the last asignacion with a numeroRegistro
    const lastAsignacion = await this.prisma.asignacion.findFirst({
      where: { numeroRegistro: { not: null } },
      orderBy: { numeroRegistro: 'desc' },
      select: { numeroRegistro: true }
    });

    let nextNumber = 1;
    if (lastAsignacion?.numeroRegistro) {
      // Extract number from TFL-0001 format
      const match = lastAsignacion.numeroRegistro.match(/TFL-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Format as TFL-0001, TFL-0002, etc.
    return `TFL-${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(createAsignacionDto: CreateAsignacionDto) {
    const { vehiculoId, usuarioId, encargadoId, fotos, ...data } = createAsignacionDto;

    // Verify existence of related entities
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehículo con ID ${vehiculoId} no encontrado`);

    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);

    const encargado = await this.prisma.usuario.findUnique({ where: { id: encargadoId } });
    if (!encargado) throw new NotFoundException(`Encargado con ID ${encargadoId} no encontrado`);

    // Note: numeroRegistro is generated when signature is uploaded (in update method)
    // Never generate it here in create, as signature is uploaded separately
    const numeroRegistro = null;

    // Create assignment
    // Note: estado defaults to ACTIVA in the schema, but will be set when signature is added
    return this.prisma.asignacion.create({
      data: {
        ...data,
        numeroRegistro,
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
    const existing = await this.findOne(id); // Verify existence

    const { fotos, ...data } = updateAsignacionDto;

    // Generate numeroRegistro if firmaUsuario is being added and doesn't exist yet
    let numeroRegistro = existing.numeroRegistro;
    if (data.firmaUsuario && !existing.numeroRegistro) {
      numeroRegistro = await this.generateNumeroRegistro();
      console.log(`📝 Generated numero registro: ${numeroRegistro} for asignacion #${id}`);
    }

    // Automatic estado flow:
    // - When kmRetorno is provided (vehicle returned), auto-transition to EN_REVISION
    // - FINALIZADA and CANCELADA must be set manually
    let estadoFinal = data.estado;

    // Auto-transition to EN_REVISION when kmRetorno is provided for first time on ACTIVA
    if (data.kmRetorno !== undefined && !existing.kmRetorno && existing.estado === 'ACTIVA') {
      estadoFinal = 'EN_REVISION' as any;
      console.log(`🔄 Auto-transition: Asignacion #${id} ${existing.estado} → EN_REVISION (kmRetorno provided)`);
    }
    // If estado is explicitly set to FINALIZADA or CANCELADA, respect that
    else if (data.estado === 'FINALIZADA' || data.estado === 'CANCELADA') {
      estadoFinal = data.estado;
      console.log(`✅ Manual transition: Asignacion #${id} ${existing.estado} → ${estadoFinal}`);
    }
    // Otherwise keep existing estado if not explicitly changed
    else if (!data.estado) {
      estadoFinal = existing.estado as any;
    }

    return this.prisma.asignacion.update({
      where: { id },
      data: {
        ...data,
        numeroRegistro: numeroRegistro || undefined,
        estado: estadoFinal,
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

  // Add photos to an existing asignacion
  async addPhotos(id: number, fotos: { tipo: string; url: string }[]) {
    await this.findOne(id); // Verify existence

    // Create all photos in a transaction
    const createdPhotos = await Promise.all(
      fotos.map(foto =>
        this.prisma.fotoAsignacion.create({
          data: {
            asignacionId: id,
            tipo: foto.tipo,
            url: foto.url
          }
        })
      )
    );

    console.log(`✅ Added ${createdPhotos.length} photos to asignacion #${id}`);
    return createdPhotos;
  }

  // Delete a specific photo
  async deletePhoto(photoId: number) {
    return this.prisma.fotoAsignacion.delete({
      where: { id: photoId }
    });
  }
}