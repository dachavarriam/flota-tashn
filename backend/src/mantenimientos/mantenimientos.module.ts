import { Module } from '@nestjs/common';
import { MantenimientosController } from './mantenimientos.controller';
import { MantenimientosService } from './mantenimientos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MantenimientosController],
  providers: [MantenimientosService],
  exports: [MantenimientosService]
})
export class MantenimientosModule {}
