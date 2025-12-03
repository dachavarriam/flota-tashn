import 'dotenv/config';
import { PrismaClient, Rol } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg(
  new Pool({
    connectionString: process.env.DATABASE_URL
  })
);

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@tas.hn';
  const adminPassword = 'admin123'; // cambiar en producción

  const existing = await prisma.usuario.findUnique({
    where: { correo: adminEmail }
  });

  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        correo: adminEmail,
        password: hashed,
        rol: Rol.ADMIN
      }
    });
    // eslint-disable-next-line no-console
    console.log(`Seed: usuario admin creado (${adminEmail}/${adminPassword})`);
  } else {
    // eslint-disable-next-line no-console
    console.log('Seed: usuario admin ya existe, se omite creación');
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
