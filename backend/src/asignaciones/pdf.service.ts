import PDFDocument from 'pdfkit';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  
  private readonly COLORS = {
    primary: '#2563eb', 
    secondary: '#1e293b', 
    text: '#334155', 
    lightBg: '#f8fafc',
    white: '#ffffff',
    border: '#e2e8f0',
    gray: '#64748b',
    success: '#16a34a',
    danger: '#dc2626', 
    warning: '#f59e0b',
  };

  async generateAsignacionPdf(asignacion: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'LETTER', 
        margin: 40, 
        autoFirstPage: true, 
        bufferPages: true 
      });
      
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: any) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const margin = 40;
      const contentWidth = doc.page.width - (margin * 2);
      const valueX = margin + 200; 

      // --- Helpers ---
      const checkPageBreak = (heightNeeded: number) => {
        if (doc.y + heightNeeded > doc.page.height - 50) {
          doc.addPage();
          doc.y = margin;
        }
      };

      const formatKey = (key: string) => {
        return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, l => l.toUpperCase()).trim();
      };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(40);
        doc.rect(margin, doc.y, contentWidth, 24).fill(this.COLORS.primary);
        doc.fillColor(this.COLORS.white)
           .fontSize(12).font('Helvetica-Bold')
           .text(title, margin + 10, doc.y + 7, { align: 'left' });
        doc.y += 10;
        doc.fillColor(this.COLORS.text);
      };

      const drawRow = (label: string, value: string | undefined | null, isEven: boolean, isValueBold: boolean = false) => {
        const rowHeight = 20;
        checkPageBreak(rowHeight);
        if (isEven) {
          doc.rect(margin, doc.y - 5, contentWidth, rowHeight).fill(this.COLORS.lightBg);
          doc.fillColor(this.COLORS.text);
        }
        const y = doc.y;
        doc.font('Helvetica-Bold').fontSize(10).text(label, margin + 10, y, { width: 180, align: 'left' });
        const fontName = isValueBold ? 'Helvetica-Bold' : 'Helvetica';
        doc.font(fontName).fontSize(10).text(value || 'N/A', valueX, y, { width: 180, align: 'left' });
        doc.y += 10;
      };

      const drawPill = (label: string, status: string, isEven: boolean) => {
        const rowHeight = 20;
        checkPageBreak(rowHeight);
        if (isEven) doc.rect(margin, doc.y - 5, contentWidth, rowHeight).fill(this.COLORS.lightBg);
        
        const y = doc.y;
        doc.fillColor(this.COLORS.text).font('Helvetica-Bold').fontSize(10)
           .text(formatKey(label), margin + 10, y, { width: 180, align: 'left' });

        let pillColor = this.COLORS.gray;
        let text = status.toUpperCase();
        if (['CORRECTO', 'OK', 'TRUE', 'SI'].includes(text)) {
            pillColor = this.COLORS.success; text = 'OK';
        } else if (['REVISAR', 'FALSE', 'NO', 'MALO'].includes(text)) {
            pillColor = this.COLORS.danger; text = 'REVISAR';
        } else if (['MEDIO', 'REGULAR'].includes(text)) {
            pillColor = this.COLORS.warning;
        }

        const pillW = 80;
        const pillH = 14;
        doc.save();
        doc.roundedRect(valueX, y - 2, pillW, pillH, 7).fill(pillColor);
        doc.fillColor(this.COLORS.white).fontSize(9).font('Helvetica-Bold');
        const txtW = doc.widthOfString(text);
        doc.text(text, valueX + (pillW - txtW) / 2, y + 2); 
        doc.restore();
        doc.y += 10;
      };

      const drawFuel = (label: string, percentage: number, isEven: boolean) => {
        const rowHeight = 20;
        checkPageBreak(rowHeight);
        if (isEven) doc.rect(margin, doc.y - 5, contentWidth, rowHeight).fill(this.COLORS.lightBg);
        const y = doc.y;
        doc.fillColor(this.COLORS.text).font('Helvetica-Bold').fontSize(10)
           .text(formatKey(label), margin + 10, y, { width: 180, align: 'left' });

        const barW = 120;
        const barH = 10;
        doc.save();
        doc.rect(valueX, y, barW, barH).fill(this.COLORS.border);
        let color = this.COLORS.success;
        if (percentage <= 25) color = this.COLORS.danger;
        else if (percentage <= 50) color = this.COLORS.warning;
        const fillW = Math.min(percentage, 100) / 100 * barW;
        if (fillW > 0) doc.rect(valueX, y, fillW, barH).fill(color);
        doc.fillColor(this.COLORS.text).fontSize(9).text(`${percentage}%`, valueX + barW + 10, y);
        doc.restore();
        doc.y += 10;
      };

      // --- 1. Header & Logo ---
      const logoPaths = [
        path.join(process.cwd(), 'backend/assets/logo.png'), 
        path.join(process.cwd(), 'assets/logo.png'), 
      ];
      let logoFound = false;
      for (const p of logoPaths) {
        if (fs.existsSync(p)) {
          doc.image(p, margin, margin, { width: 60 });
          logoFound = true;
          break;
        }
      }

      const titleX = logoFound ? margin + 80 : margin;
      doc.y = margin + 10;
      doc.fillColor(this.COLORS.secondary).fontSize(18).font('Helvetica-Bold')
         .text('REPORTE DE ASIGNACIÓN', titleX, doc.y, { align: 'left' });
      
      // ---   REGISTRO Y FECHA ---
      doc.moveDown(0.2);
      
      // 1. Registro Grande y Azul
      doc.fillColor(this.COLORS.secondary).fontSize(14).font('Helvetica-Bold')
         .text(`Registro: ${asignacion.numeroRegistro || 'Pendiente'}`, titleX, doc.y);
      
      // 2. Fecha con formato largo
      const fechaFormateada = new Date(asignacion.fecha).toLocaleDateString('es-HN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      // Capitalizar primera letra de la fecha (ej: "lunes" -> "Lunes")
      const fechaFinal = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

      doc.fillColor(this.COLORS.text).fontSize(10).font('Helvetica')
         .text(`Fecha: ${fechaFinal}`, titleX, doc.y + 3);

      doc.y = margin + 90; // Bajamos un poco más para dar aire al header grande

      // --- 2. Details ---
      drawSectionHeader('INFORMACIÓN GENERAL');
      drawRow('Vehículo:', `${asignacion.vehiculo?.placa} - ${asignacion.vehiculo?.marca} ${asignacion.vehiculo?.modelo}`, true);
      drawRow('Tipo:', asignacion.vehiculo?.tipo, false);
      drawRow('Conductor:', asignacion.usuario?.nombre, true);
      drawRow('Encargado:', asignacion.encargado?.nombre, false);
      drawRow('Estado:', asignacion.estado, true, true);
      drawRow('Uso:', asignacion.uso, false);
      doc.y += 10;

      // --- 3. Trip ---
      drawSectionHeader('DETALLES DEL VIAJE');
      drawRow('Hora Salida:', asignacion.horaSalida, true);
      drawRow('Hora Retorno:', asignacion.horaRetorno, false);
      drawRow('KM Salida:', `${asignacion.kmSalida || 0}`, true);
      drawRow('KM Retorno:', `${asignacion.kmRetorno || 'En curso'}`, false);
      if (asignacion.kmSalida && asignacion.kmRetorno) {
        drawRow('Recorrido:', `${asignacion.kmRetorno - asignacion.kmSalida} km`, true);
      }
      doc.y += 10;

      // --- 4. Checklist/Levels ---
      if (asignacion.checklist || asignacion.niveles) {
        drawSectionHeader('INSPECCIÓN Y NIVELES');
        const checklist = asignacion.checklist ? (typeof asignacion.checklist === 'string' ? JSON.parse(asignacion.checklist) : asignacion.checklist) : {};
        const niveles = asignacion.niveles ? (typeof asignacion.niveles === 'string' ? JSON.parse(asignacion.niveles) : asignacion.niveles) : {};
        let isEven = true;
        
        if (Object.keys(checklist).length > 0) {
           doc.font('Helvetica-Bold').fontSize(11).text('Checklist', margin + 10, doc.y + 5);
           doc.y += 20;
           Object.entries(checklist).forEach(([k, v]) => {
             drawPill(k, v ? 'CORRECTO' : 'REVISAR', isEven);
             isEven = !isEven;
           });
        }
        
        if (Object.keys(niveles).length > 0) {
           doc.y += 10;
           checkPageBreak(30);
           doc.fillColor(this.COLORS.text).font('Helvetica-Bold').fontSize(11).text('Niveles', margin + 10, doc.y);
           doc.y += 15;
           Object.entries(niveles).forEach(([k, v]) => {
             if (k.toLowerCase().includes('combustible')) {
                 drawFuel(k, Number(v) || 0, isEven);
             } else {
                 const valStr = String(v).toUpperCase();
                 if (['OK', 'CORRECTO', 'BIEN', 'REVISAR', 'MALO', 'MEDIO'].includes(valStr)) {
                     drawPill(k, valStr, isEven);
                 } else {
                     drawRow(formatKey(k), String(v), isEven);
                 }
             }
             isEven = !isEven;
           });
        }
        doc.y += 10;
      }

      // --- 5. Damages ---
      drawSectionHeader('OBSERVACIONES Y DAÑOS');
      drawRow('Tiene Daños:', asignacion.tieneDanos ? 'SÍ' : 'NO', true);
      if (asignacion.tieneDanos && asignacion.fotos?.length > 0) {
        drawRow('Fotos Adjuntas:', `${asignacion.fotos.length}`, false);
      }
      if (asignacion.observaciones) {
        doc.y += 10;
        checkPageBreak(50);
        doc.font('Helvetica-Bold').text('Observaciones:', margin + 10, doc.y);
        doc.y += 5;
        doc.font('Helvetica').text(asignacion.observaciones, margin + 10, doc.y, { width: contentWidth, align: 'justify' });
        doc.y += 10;
      }

      // --- 6. Signature (AQUI PUEDES MODIFICAR) ---
checkPageBreak(150);
      doc.y += 30;
      
      const sigBoxHeight = 100;
      doc.rect(margin, doc.y, contentWidth, sigBoxHeight).strokeColor(this.COLORS.border).stroke();
      const sigY = doc.y; // <--- Esta es la coordenada Y (vertical) donde empieza la caja
      
      doc.fontSize(9).fillColor(this.COLORS.gray).text('FIRMA DEL CONDUCTOR', margin + 10, sigY + 10);

      if (asignacion.firmaUsuario) {
        const cleanPath = asignacion.firmaUsuario.startsWith('/') ? asignacion.firmaUsuario.substring(1) : asignacion.firmaUsuario;
        const possiblePaths = [path.join(process.cwd(), cleanPath), path.join(process.cwd(), 'backend', cleanPath), path.join(process.cwd(), '..', cleanPath), path.resolve(cleanPath)];
        let foundSig = '';
        for (const p of possiblePaths) { if (fs.existsSync(p)) { foundSig = p; break; } }

        if (foundSig) {
          try {
            // --- CONFIGURACIÓN MANUAL DE LA FIRMA ---
            // 1. Tamaño Máximo: Cambia estos números para hacerla más grande
            // contentWidth - 40 usa casi todo el ancho. Si quieres menos, pon un número fijo (ej: 300)
            const maxAncho = 800; 
            const maxAlto = 300; // Altura máxima de la imagen dentro de la caja

            // 2. Posición (Centrado Automático):
            // (AnchoPagina / 2) - (AnchoDeseado / 2)
            const posX = (doc.page.width / 2) - (maxAncho / 2);
            
            // 3. Posición Vertical:
            // sigY + 20 baja la firma 20 puntos desde el borde superior de la caja
            const posY = sigY - 90;

            doc.image(foundSig, posX, posY, { 
                fit: [maxAncho, maxAlto], // <--- ESTO CONTROLA EL TAMAÑO
                align: 'center' 
            });
          } catch (e) {
            this.logger.error('Signature error', e);
          }
        }
      }

      doc.fontSize(10).fillColor(this.COLORS.text)
         .text(asignacion.usuario?.nombre || '', 0, sigY + 80, { width: doc.page.width, align: 'center' });
      // --- Footer ---
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.moveTo(margin, doc.page.height - 60).lineTo(doc.page.width - margin, doc.page.height - 60).strokeColor(this.COLORS.border).stroke();
        doc.fontSize(8).fillColor(this.COLORS.gray).text(`Sistema de Gestión de Flota TAS - Generado el ${new Date().toLocaleString('es-HN')}`, margin, doc.page.height - 50, { align: 'left', width: 300, baseline: 'top' });
        doc.text(`Pág ${i + 1}/${range.count}`, doc.page.width - margin - 100, doc.page.height - 50, { align: 'right', width: 100, baseline: 'top' });
      }
      doc.end();
    });
  }
}