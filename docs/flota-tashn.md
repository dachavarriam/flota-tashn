Sistema de Asignación Vehicular TAS Honduras (flota.tashonduras.com)

Versión: 0.1
Estado: Desarrollo inicial

⸻

📌 Objetivo General

Crear un sistema digital para gestionar la asignación, revisión, historial, mantenimiento y control de flota vehicular de TAS Honduras, accesible desde móvil y escritorio, integrado con Postgres, n8n y Slack, y preparado para integrarse al futuro Mini ERP TAS.

⸻

📌 Funcionalidades principales

1. Formulario digital de asignación vehicular (Mobile First)
	•	Selección de vehículo
	•	Datos del conductor
	•	Foto y checklist
	•	Niveles: combustible, aceite, coolant
	•	Firma del encargado
	•	Firma del conductor
	•	Observaciones
	•	Generación de PDF
	•	Envío automático a Slack
	•	Registro en BD

⸻

2. Dashboard de administración
	•	Vehículos
	•	Estado de cada uno
	•	Historial de asignaciones
	•	Alertas
	•	Mantenimientos
	•	Filtros por supervisor, encargado, vehículo

⸻

3. Roles

Usuario
	•	Ve sus asignaciones
	•	Firma
	•	Reporta problemas

Encargado
	•	Crea asignaciones
	•	Revisa vehículos
	•	Ve sus propias asignaciones
	•	Recibe alertas

Supervisor
	•	Acceso al dashboard
	•	Puede apoyar en emergencias

Gerencia (Admin)
	•	Acceso total
	•	Crea usuarios
	•	Edita vehículos
	•	Configura mantenimiento

⸻

4. Integraciones

• n8n
	•	Enviar PDF a Slack
	•	Crear alertas
	•	Leer Odoo (empleados, proyectos)
	•	Recordatorios de mantenimiento

• Slack
	•	Canal #flota-tas
	•	Recibir reportes
	•	Recibir alertas

• Odoo (posterior)
	•	Empleados
	•	Clientes
	•	Proyectos
	•	Facturas de mantenimiento

⸻

📌 Arquitectura Técnica

Backend
	•	NestJS
	•	Prisma ORM
	•	Postgres
	•	JWT (simple)

Frontend
	•	React
	•	Vite
	•	TailwindCSS
	•	Mobile-first

Infraestructura
	•	Docker
	•	Cloudflare Tunnel
	•	Postgres en servidor local
	•	GitHub para repositorio

📌 Base de Datos (Prisma Schema preliminar)

model Usuario {
  id        Int      @id @default(autoincrement())
  nombre    String
  correo    String   @unique
  password  String
  rol       Rol
  activo    Boolean  @default(true)
  asignacionesAsignadas Asignacion[] @relation("EncargadoAsignaciones")
  asignacionesRecibidas Asignacion[] @relation("UsuarioAsignaciones")
}

enum Rol {
  USUARIO
  ENCARGADO
  SUPERVISOR
  ADMIN
}

model Vehiculo {
  id                       Int      @id @default(autoincrement())
  placa                    String   @unique
  marca                    String?
  modelo                   String?
  tipo                     String?
  kmActual                 Int      @default(0)
  kmUltimoMantenimiento    Int      @default(0)
  fechaUltimoMantenimiento DateTime?
  asignaciones             Asignacion[]
}

model Asignacion {
  id            Int      @id @default(autoincrement())
  vehiculoId    Int
  usuarioId     Int
  encargadoId   Int
  fecha         DateTime @default(now())
  horaSalida    String?
  kmSalida      Int?
  uso           String?
  checklist     Json?
  niveles       Json?
  observaciones String?
  pdfUrl        String?
  firmaUsuario  String?
  firmaEncargado String?

  vehiculo      Vehiculo @relation(fields: [vehiculoId], references: [id])
  usuario       Usuario  @relation("UsuarioAsignaciones", fields: [usuarioId], references: [id])
  encargado     Usuario  @relation("EncargadoAsignaciones", fields: [encargadoId], references: [id])
  fotos         FotoAsignacion[]
}

model FotoAsignacion {
  id           Int    @id @default(autoincrement())
  asignacionId Int
  tipo         String
  url          String
  asignacion   Asignacion @relation(fields: [asignacionId], references: [id])
}


