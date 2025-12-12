import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly slackWebhookUrl: string;
  private readonly n8nWebhookUrl: string;

  constructor(private configService: ConfigService) {
    this.slackWebhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL') || '';
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || '';
  }

  async sendPdfToSlack(
    pdfBuffer: Buffer,
    asignacion: any,
    channel?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // If n8n webhook is configured, use it (recommended)
      if (this.n8nWebhookUrl) {
        return await this.sendViaN8n(pdfBuffer, asignacion);
      }

      // Otherwise, use direct Slack webhook
      if (this.slackWebhookUrl) {
        return await this.sendViaSlackWebhook(pdfBuffer, asignacion, channel);
      }

      this.logger.warn('No Slack or n8n webhook configured');
      return {
        success: false,
        message: 'No webhook configured. Set SLACK_WEBHOOK_URL or N8N_WEBHOOK_URL'
      };
    } catch (error) {
      this.logger.error('Error sending PDF to Slack', error);
      return {
        success: false,
        message: (error as any).message || 'Error sending to Slack'
      };
    }
  }

  private async sendViaN8n(pdfBuffer: Buffer, asignacion: any) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
      const filename = `asignacion_${asignacion.numeroRegistro || asignacion.id}_${Date.now()}.pdf`;

      formData.append('file', blob, filename);
      formData.append('asignacionId', asignacion.id.toString());
      formData.append('numeroRegistro', asignacion.numeroRegistro || 'N/A');
      formData.append('vehiculo', asignacion.vehiculo?.placa || 'N/A');
      formData.append('conductor', asignacion.usuario?.nombre || 'N/A');
      formData.append('fecha', new Date(asignacion.fecha).toISOString());

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'PDF sent successfully via n8n'
      };
    } catch (error) {
      throw new Error(`n8n error: ${(error as any).message}`);
    }
  }

  private async sendViaSlackWebhook(pdfBuffer: Buffer, asignacion: any, channel?: string) {
    // Note: Direct Slack webhook only supports text messages, not file uploads
    // For file uploads, you need to use Slack API with a bot token
    // This sends a notification message instead

    const message = {
      text: `📄 *Nuevo Reporte de Asignación Generado*`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📄 Reporte de Asignación'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Registro:*\n${asignacion.numeroRegistro || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Vehículo:*\n${asignacion.vehiculo?.placa || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Conductor:*\n${asignacion.usuario?.nombre || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Estado:*\n${asignacion.estado}`
            },
            {
              type: 'mrkdwn',
              text: `*Fecha:*\n${new Date(asignacion.fecha).toLocaleDateString('es-HN')}`
            },
            {
              type: 'mrkdwn',
              text: `*KM:*\n${asignacion.kmSalida || 'N/A'} - ${asignacion.kmRetorno || 'En curso'}`
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `PDF generado (${(pdfBuffer.length / 1024).toFixed(2)} KB) - Configurar n8n o Slack API para enviar archivos`
            }
          ]
        }
      ]
    };

    const response = await fetch(this.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }

    return {
      success: true,
      message: 'Notification sent to Slack (configure n8n for file upload)'
    };
  }

  async sendSimpleMessage(message: string): Promise<boolean> {
    try {
      const url = this.n8nWebhookUrl || this.slackWebhookUrl;
      if (!url) return false;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      return response.ok;
    } catch (error) {
      this.logger.error('Error sending message', error);
      return false;
    }
  }
}
