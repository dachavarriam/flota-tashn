import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesUploadController } from './asignaciones-upload.controller';
import { AsignacionesService } from './asignaciones.service';
import { PdfService } from './pdf.service';
import { SlackService } from './slack.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AsignacionesController, AsignacionesUploadController],
  providers: [AsignacionesService, PdfService, SlackService],
  exports: [AsignacionesService, PdfService, SlackService]
})
export class AsignacionesModule {}
