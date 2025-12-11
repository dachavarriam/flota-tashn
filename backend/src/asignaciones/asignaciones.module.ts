import { Module } from '@nestjs/common';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesUploadController } from './asignaciones-upload.controller';
import { AsignacionesService } from './asignaciones.service';

@Module({
  controllers: [AsignacionesController, AsignacionesUploadController],
  providers: [AsignacionesService]
})
export class AsignacionesModule {}
