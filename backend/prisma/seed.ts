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
  // Seed usuarios reales de TAS Honduras
  const defaultPassword = 'TAS2024'; // Contraseña por defecto, cambiar en primer login

  const usuarios = [
    {
      nombre: 'Daniel Antonio Chavarria Medina',
      correo: 'dchavarria@tas-seguridad.com',
      rol: Rol.ADMIN
    },
    {
      nombre: 'Jose Arturo Chavarria Medina',
      correo: 'jchavarriam@tas-seguridad.com',
      rol: Rol.ADMIN
    },
    {
      nombre: 'Kenya Alexandra Hernandez Chiquillo',
      correo: 'contahns@tas-seguridad.com',
      rol: Rol.SUPERVISOR
    },
    {
      nombre: 'Josselyn Vanessa Viera Membreño',
      correo: 'jviera@tashonduras.com',
      rol: Rol.SUPERVISOR
    },
    {
      nombre: 'Irvin Adalberto Jimenez Fuentes',
      correo: 'ijimenez@tashonduras.com',
      rol: Rol.USUARIO
    },
    {
      nombre: 'Emilio Javier Zuniga Corrales',
      correo: 'ezuniga@ejemplo.com',
      rol: Rol.USUARIO
    },
    {
      nombre: 'Denis Francisco Guerrero Portillo',
      correo: 'dguerrero@ejemplo.com',
      rol: Rol.USUARIO
    },
    {
      nombre: 'Elder Nahum Lopez Mejia',
      correo: 'elopez@ejemplo.com',
      rol: Rol.USUARIO
    },
    {
      nombre: 'Dalton Israel Reyes Rodriguez',
      correo: 'dreyes@tashonduras.com',
      rol: Rol.ENCARGADO
    },
    {
      nombre: 'Eduardo Arturo Villatoro Rivera',
      correo: 'evillatoro@tashonduras.com',
      rol: Rol.ENCARGADO
    }
  ];

  for (const userData of usuarios) {
    const existing = await prisma.usuario.findUnique({
      where: { correo: userData.correo }
    });

    if (!existing) {
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await prisma.usuario.create({
        data: {
          ...userData,
          password: hashed
        }
      });
      // eslint-disable-next-line no-console
      console.log(`✓ Usuario creado: ${userData.nombre} (${userData.correo}) - Rol: ${userData.rol}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`✓ Usuario ya existe: ${userData.correo}`);
    }
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
