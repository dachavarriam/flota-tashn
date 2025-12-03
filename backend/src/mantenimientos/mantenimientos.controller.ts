import { Controller, Get } from '@nestjs/common';
import { MantenimientosService } from './mantenimientos.service';

@Controller('mantenimientos')
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Get('health')
  health() {
    return { status: this.mantenimientosService.health() };
  }
}
