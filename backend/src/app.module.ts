import { Module } from '@nestjs/common';
import { AlertasModule } from './alertas/alertas.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { MantenimientosModule } from './mantenimientos/mantenimientos.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AuthModule,
    UsuariosModule,
    VehiculosModule,
    AsignacionesModule,
    MantenimientosModule,
    AlertasModule
  ]
})
export class AppModule {}
