import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AsignacionesService } from './asignaciones.service';
import { PdfService } from './pdf.service';
import { SlackService } from './slack.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionesController {
  constructor(
    private readonly asignacionesService: AsignacionesService,
    private readonly pdfService: PdfService,
    private readonly slackService: SlackService
  ) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.SUPERVISOR, Rol.ENCARGADO)
  create(@Body() createAsignacionDto: CreateAsignacionDto) {
    return this.asignacionesService.create(createAsignacionDto);
  }

  @Get()
  findAll() {
    return this.asignacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.SUPERVISOR, Rol.ENCARGADO)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAsignacionDto: UpdateAsignacionDto) {
    return this.asignacionesService.update(id, updateAsignacionDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN, Rol.SUPERVISOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.remove(id);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const asignacion = await this.asignacionesService.findOne(id);
    const pdfBuffer = await this.pdfService.generateAsignacionPdf(asignacion);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=asignacion_${asignacion.numeroRegistro || id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Post(':id/send-slack')
  @Roles(Rol.ADMIN, Rol.SUPERVISOR, Rol.ENCARGADO)
  async sendToSlack(@Param('id', ParseIntPipe) id: number) {
    const asignacion = await this.asignacionesService.findOne(id);
    const pdfBuffer = await this.pdfService.generateAsignacionPdf(asignacion);
    const result = await this.slackService.sendPdfToSlack(pdfBuffer, asignacion);
    return result;
  }
}