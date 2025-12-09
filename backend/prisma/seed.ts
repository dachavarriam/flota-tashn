import 'dotenv/config';
import { PrismaClient, Rol } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'flota',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

const adapter = new PrismaPg(new Pool(poolConfig));
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed usuario admin
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
    console.log(`✓ Usuario admin creado (${adminEmail}/${adminPassword})`);
  } else {
    // eslint-disable-next-line no-console
    console.log('✓ Usuario admin ya existe');
  }

  // Seed vehículos de TAS Honduras
  const vehiculos = [
    {
      placa: 'HBP4760',
      marca: 'Mitsubishi',
      modelo: 'L300 2013',
      tipo: 'Panel',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    },
    {
      placa: 'HBP4761',
      marca: 'Chevrolet',
      modelo: 'CMV 2013',
      tipo: 'Panel',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    },
    {
      placa: 'HDL2845',
      marca: 'Fiat',
      modelo: 'Furgon 2012',
      tipo: 'Panel',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    },
    {
      placa: 'HBO3747',
      marca: 'Kia',
      modelo: 'K2700 2017',
      tipo: 'Camion',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    },
    {
      placa: 'JAK6227',
      marca: 'Chevrolet',
      modelo: 'S-10 2004',
      tipo: 'Pick Up',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    },
    {
      placa: 'HBO3748',
      marca: 'Kia',
      modelo: 'K2700 2017',
      tipo: 'Camion',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    },
    {
      placa: 'HDL3848',
      marca: 'Ford',
      modelo: 'Ranger 2007',
      tipo: 'Pick Up',
      kmActual: 0,
      kmUltimoMantenimiento: 0
    }
  ];

  for (const vehiculo of vehiculos) {
    const existingVehiculo = await prisma.vehiculo.findUnique({
      where: { placa: vehiculo.placa }
    });

    if (!existingVehiculo) {
      await prisma.vehiculo.create({ data: vehiculo });
      // eslint-disable-next-line no-console
      console.log(`✓ Vehículo creado: ${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`✓ Vehículo ya existe: ${vehiculo.placa}`);
    }
  }

  // eslint-disable-next-line no-console
  console.log('\n✅ Seed completado exitosamente');
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
