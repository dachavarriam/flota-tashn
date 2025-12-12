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
    gray: '#64748b'
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

      // --- Helpers ---
      const checkPageBreak = (heightNeeded: number) => {
        if (doc.y + heightNeeded > doc.page.height - 50) {
          doc.addPage();
          doc.y = margin;
        }
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

      const drawRow = (label: string, value: string | undefined | null, isEven: boolean) => {
        const rowHeight = 20;
        checkPageBreak(rowHeight);
        
        if (isEven) {
          doc.rect(margin, doc.y - 5, contentWidth, rowHeight).fill(this.COLORS.lightBg);
          doc.fillColor(this.COLORS.text);
        }

        const y = doc.y;
        doc.font('Helvetica-Bold').fontSize(10).text(label, margin + 10, y, { width: 180, align: 'left' });
        doc.font('Helvetica').fontSize(10).text(value || 'N/A', margin + 200, y, { width: 300, align: 'left' });
        
        doc.y += 10;
      };

      // --- 1. Header & Logo ---
      const logoPaths = [
        path.join(process.cwd(), 'backend/assets/logo.png'), // from root
        path.join(process.cwd(), 'assets/logo.png'), // from backend
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
      
      doc.fontSize(10).font('Helvetica').fillColor(this.COLORS.text)
         .text(`Registro: ${asignacion.numeroRegistro || 'Pendiente'}`, titleX, doc.y + 5)
         .text(`Fecha: ${new Date(asignacion.fecha).toLocaleDateString('es-HN')}`, titleX, doc.y + 5);

      doc.y = margin + 80; // Ensure we start below logo

      // --- 2. Details ---
      
      drawSectionHeader('INFORMACIÓN GENERAL');
      drawRow('Vehículo:', `${asignacion.vehiculo?.placa} - ${asignacion.vehiculo?.marca} ${asignacion.vehiculo?.modelo}`, true);
      drawRow('Tipo:', asignacion.vehiculo?.tipo, false);
      drawRow('Conductor:', asignacion.usuario?.nombre, true);
      drawRow('Encargado:', asignacion.encargado?.nombre, false);
      drawRow('Estado:', asignacion.estado, true);
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
        drawSectionHeader('INSPECCIÓN');
        
        const checklist = asignacion.checklist ? (typeof asignacion.checklist === 'string' ? JSON.parse(asignacion.checklist) : asignacion.checklist) : {};
        const niveles = asignacion.niveles ? (typeof asignacion.niveles === 'string' ? JSON.parse(asignacion.niveles) : asignacion.niveles) : {};

        let isEven = true;
        
        // Combine them visually
        if (Object.keys(checklist).length > 0) {
           doc.font('Helvetica-Bold').fontSize(11).text('Checklist', margin + 10, doc.y + 5);
           doc.y += 20;
           Object.entries(checklist).forEach(([k, v]) => {
             drawRow(k, v ? 'CORRECTO' : 'REVISAR', isEven);
             isEven = !isEven;
           });
        }
        
        if (Object.keys(niveles).length > 0) {
           doc.y += 10;
           doc.fillColor(this.COLORS.text).font('Helvetica-Bold').fontSize(11).text('Niveles', margin + 10, doc.y);
           doc.y += 15;
           Object.entries(niveles).forEach(([k, v]) => {
             drawRow(k, v as string, isEven);
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

      // --- 6. Signature ---
      checkPageBreak(150);
      doc.y += 30;
      
      const sigBoxHeight = 100;
      doc.rect(margin, doc.y, contentWidth, sigBoxHeight).strokeColor(this.COLORS.border).stroke();
      const sigY = doc.y;
      
      doc.fontSize(9).fillColor(this.COLORS.gray).text('FIRMA DEL CONDUCTOR', margin + 10, sigY + 10);

      // Embed Image
      if (asignacion.firmaUsuario) {
        const cleanPath = asignacion.firmaUsuario.startsWith('/') ? asignacion.firmaUsuario.substring(1) : asignacion.firmaUsuario;
        const possiblePaths = [
          path.join(process.cwd(), cleanPath),
          path.join(process.cwd(), 'backend', cleanPath),
          path.join(process.cwd(), '..', cleanPath),
          path.resolve(cleanPath)
        ];
        
        let foundSig = '';
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) { foundSig = p; break; }
        }

        if (foundSig) {
          try {
            // Center in box
            const imgW = 150;
            const imgX = (doc.page.width - imgW) / 2;
            doc.image(foundSig, imgX, sigY + 20, { fit: [imgW, 60] });
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
        
        // Draw line
        doc.moveTo(margin, doc.page.height - 60)
           .lineTo(doc.page.width - margin, doc.page.height - 60)
           .strokeColor(this.COLORS.border)
           .stroke();

        doc.fontSize(8).fillColor(this.COLORS.gray)
           .text(
             `Sistema de Gestión de Flota TAS - Generado el ${new Date().toLocaleString('es-HN')}`,
             margin, 
             doc.page.height - 50, 
             { align: 'left', width: 300, baseline: 'top' }
           );
           
        doc.text(
          `Pág ${i + 1}/${range.count}`,
          doc.page.width - margin - 100, 
          doc.page.height - 50, 
          { align: 'right', width: 100, baseline: 'top' }
        );
      }

      doc.end();
    });
  }
}