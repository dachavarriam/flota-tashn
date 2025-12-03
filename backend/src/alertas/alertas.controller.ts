import { Controller, Get } from '@nestjs/common';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get('health')
  health() {
    return { status: this.alertasService.health() };
  }
}
