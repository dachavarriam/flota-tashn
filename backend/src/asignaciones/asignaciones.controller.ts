import { Controller, Get } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Get('health')
  health() {
    return { status: this.asignacionesService.health() };
  }
}
