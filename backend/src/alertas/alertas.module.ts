import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AsignacionesModule } from '../asignaciones/asignaciones.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule, 
    AsignacionesModule
  ],
  controllers: [AlertasController],
  providers: [AlertasService]
})
export class AlertasModule {}
