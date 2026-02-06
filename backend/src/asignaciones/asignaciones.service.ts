import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { PdfService } from './pdf.service';
import { SlackService } from './slack.service';

@Injectable()
export class AsignacionesService {
  private readonly logger = new Logger(AsignacionesService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private slackService: SlackService
  ) {}

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

  async create(createAsignacionDto: CreateAsignacionDto, currentUser: any) {
    const { vehiculoId, usuarioId, encargadoId, fotos, ...data } = createAsignacionDto;

    // Verify existence of related entities
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehículo con ID ${vehiculoId} no encontrado`);

    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);

    const encargado = await this.prisma.usuario.findUnique({ where: { id: encargadoId } });
    if (!encargado) throw new NotFoundException(`Encargado con ID ${encargadoId} no encontrado`);

    // Check if vehicle already has an active assignment
    const activeAssignment = await this.prisma.asignacion.findFirst({
      where: {
        vehiculoId,
        estado: {
          in: ['ACTIVA', 'EN_REVISION']
        }
      },
      include: {
        usuario: { select: { nombre: true } }
      }
    });

    if (activeAssignment) {
      throw new BadRequestException(
        `El vehículo ${vehiculo.placa} ya está asignado a ${activeAssignment.usuario.nombre} (Estado: ${activeAssignment.estado})`
      );
    }

    // Validate KM Sequence
    // Required: kmSalida >= vehiculo.kmActual
    // Exception: ADMIN or SUPERUSER can override
    if (data.kmSalida !== undefined && data.kmSalida < vehiculo.kmActual) {
      const isOverrideAllowed = currentUser.rol === 'ADMIN' || currentUser.rol === 'SUPERUSER';
      
      if (!isOverrideAllowed) {
        throw new BadRequestException(
          `El kilometraje de salida (${data.kmSalida}) no puede ser menor al actual del vehículo (${vehiculo.kmActual}). Solo un Administrador puede corregir esto.`
        );
      } else {
        this.logger.warn(`⚠️ ADMIN Override: Asignacion creada con kmSalida (${data.kmSalida}) < kmActual (${vehiculo.kmActual}) por ${currentUser.nombre}`);
      }
    }

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

  async findAll(usuario: any) {
    if (['ADMIN', 'ENCARGADO', 'SUPERVISOR'].includes(usuario.rol)) {
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
  return this.prisma.asignacion.findMany({
    where: {
      usuarioId: usuario.id,
    },
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

    // Validate kmRetorno > kmSalida
    if (data.kmRetorno !== undefined) {
      const kmSalida = existing.kmSalida;
      if (!kmSalida) {
        throw new BadRequestException('No se puede establecer kmRetorno sin un kmSalida registrado');
      }
      if (data.kmRetorno <= kmSalida) {
        throw new BadRequestException(
          `El kilometraje de retorno (${data.kmRetorno}) debe ser mayor al kilometraje de salida (${kmSalida})`
        );
      }
    }

    // Generate numeroRegistro if firmaUsuario is being added and doesn't exist yet
    let numeroRegistro = existing.numeroRegistro;
    let isNewRegistration = false;
    
    if (data.firmaUsuario && !existing.numeroRegistro) {
      numeroRegistro = await this.generateNumeroRegistro();
      isNewRegistration = true;
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

    const updatedAsignacion = await this.prisma.asignacion.update({
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

    // Update Vehicle KM if kmRetorno was set
    if (data.kmRetorno && data.kmRetorno > (existing.vehiculo?.kmActual || 0)) {
       await this.prisma.vehiculo.update({
         where: { id: existing.vehiculoId },
         data: { kmActual: data.kmRetorno }
       });
       this.logger.log(`🚗 Updated Vehicle #${existing.vehiculoId} kmActual to ${data.kmRetorno}`);
    }

    // If a new registration number was generated (meaning signatures were added), send notification
    if (isNewRegistration) {
      this.handleNewAssignmentNotification(updatedAsignacion).catch(err => 
        this.logger.error(`Error handling new assignment notification for #${id}`, err)
      );
    }

    return updatedAsignacion;
  }

  private async handleNewAssignmentNotification(asignacion: any) {
    try {
      this.logger.log(`🚀 Generating PDF and sending notification for Asignacion #${asignacion.id}`);
      const pdfBuffer = await this.pdfService.generateAsignacionPdf(asignacion);
      await this.slackService.sendPdfToSlack(pdfBuffer, asignacion);
    } catch (error) {
      this.logger.error('Failed to send assignment notification', error);
    }
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