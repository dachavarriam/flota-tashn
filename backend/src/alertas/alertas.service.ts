import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SlackService } from '../asignaciones/slack.service';

@Injectable()
export class AlertasService {
  private readonly logger = new Logger(AlertasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slackService: SlackService
  ) {}

  health(): string {
    return 'alertas ok';
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkMantenimientos() {
    this.logger.log('⏰ Running daily maintenance check...');
    
    const vehiculos = await this.prisma.vehiculo.findMany();
    let alertasEnviadas = 0;

    for (const v of vehiculos) {
      const kmRecorridos = v.kmActual - v.kmUltimoMantenimiento;
      
      // Alert threshold: 4500 km
      if (kmRecorridos >= 4500) {
        const msg = `⚠️ *Alerta de Mantenimiento Preventivo*\n\n` +
                    `🚗 *Vehículo:* ${v.placa} (${v.marca} ${v.modelo})\n` +
                    `📏 *KM Actual:* ${v.kmActual}\n` +
                    `🔧 *Último Mantenimiento:* hace ${kmRecorridos} km\n` +
                    `📅 *Fecha Último:* ${v.fechaUltimoMantenimiento ? new Date(v.fechaUltimoMantenimiento).toLocaleDateString() : 'N/A'}\n\n` +
                    `> Se recomienda programar mantenimiento inmediato (Límite: 5000 km).`;
        
        await this.slackService.sendSimpleMessage(msg);
        alertasEnviadas++;
        this.logger.warn(`Alert sent for vehicle ${v.placa} (+${kmRecorridos} km)`);
      }
    }

    this.logger.log(`✅ Maintenance check complete. Sent ${alertasEnviadas} alerts.`);
  }
}
