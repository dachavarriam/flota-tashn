import { Controller, Get } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get('health')
  health() {
    return { status: this.vehiculosService.health() };
  }
}
