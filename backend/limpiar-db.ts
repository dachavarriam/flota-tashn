import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Explicitly pass an empty object or basic log config to satisfy constructor requirements if strict
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('⚠️  INICIANDO LIMPIEZA TOTAL DE ASIGNACIONES...');

  try {
    // 1. Obtener todas las fotos para borrar archivos fisicos
    const fotos = await prisma.fotoAsignacion.findMany();
    
    console.log(`📸  Encontradas ${fotos.length} fotos para eliminar del disco...`);

    let fotosBorradas = 0;
    for (const foto of fotos) {
      // Ajusta la ruta si es necesario. Asumimos uploads/photos relativo a la raiz del backend
      // Si el script corre en backend/, uploads está en ./uploads
      const fileName = path.basename(foto.url);
      const filePath = path.join(__dirname, 'uploads', 'photos', fileName);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          fotosBorradas++;
        } catch (e) {
          console.error(`Error borrando archivo ${filePath}:`, e);
        }
      }
    }
    console.log(`✅  ${fotosBorradas} archivos de fotos eliminados físicamente.`);

    // 2. Limpiar Base de Datos
    console.log('🧹  Limpiando tabla de Asignaciones en base de datos...');
    
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Asignacion" RESTART IDENTITY CASCADE;`);
    console.log('✅  Tabla Asignacion truncada y contadores reiniciados.');

  } catch (error) {
    console.error('❌  Ocurrió un error:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
