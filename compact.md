🚗 Proyecto: flota-tashonduras — Sistema de Asignación y Control de Flota Vehicular

Estado: Desarrollo inicial
Propósito: Crear un sistema digital para la gestión completa de asignaciones vehiculares, inspecciones, historial, mantenimiento y alertas, accesible desde móvil y escritorio, integrado con Postgres, n8n y Slack, con backend NestJS 11 y frontend React 19.

⸻

🧱 Arquitectura General

Frontend (React 19 + Vite + TailwindCSS 4)
     ↕ REST API
Backend (NestJS 11 + Prisma ORM)
     ↕
PostgreSQL 16 (Servidor local)
     ↕
n8n (Slack notifications + PDF workflows + Odoo sync)

Infraestructura expuesta vía Cloudflare Tunnel en
https://flota.tashonduras.com

⸻

🎯 Módulos principales

1. Autenticación
	•	Login simple: correo + contraseña
	•	JWT (Acceso con roles)
	•	Roles soportados:
	•	USUARIO (empleado)
	•	ENCARGADO (quien asigna vehículos)
	•	SUPERVISOR (RRHH/Admin)
	•	ADMIN (Gerencia)

⸻

2. Vehículos
	•	Registro de vehículos
	•	Placa, marca, modelo, tipo
	•	KM actual
	•	Último mantenimiento
	•	Historial

⸻

3. Asignaciones
	•	Vehículo → Conductor → Encargado
	•	Checklists
	•	Niveles: combustible, aceite, coolant
	•	Fotos (rallones, abolladuras, interior, exterior)
	•	Firmas (conductor, encargado)
	•	Observaciones
	•	Generación de PDF
	•	Envío a Slack
	•	Registro de historial

⸻

4. Mantenimientos
	•	Registro de mantenimientos
	•	Fecha, descripción, costo
	•	Próximo mantenimiento por KM
	•	Alertas automáticas vía n8n

⸻

5. Alertas
	•	Daños
	•	Niveles bajos
	•	Mantenimientos vencidos
	•	Faltas de herramientas
	•	Envío automático a Slack

⸻

6. Dashboard Web
	•	Vista general de vehículos
	•	Estado de cada vehículo
	•	Historial por vehículo
	•	Reportes por encargado
	•	Filtros por fecha / usuario / vehículo
	•	Actividades recientes

⸻

📐 Base de Datos (Prisma 6.x) — Esquema Compacto

model Usuario {
  id       Int    @id @default(autoincrement())
  nombre   String
  correo   String @unique
  password String
  rol      Rol
  activo   Boolean @default(true)
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
  id                       Int @id @default(autoincrement())
  placa                    String @unique
  marca                    String?
  modelo                   String?
  tipo                     String?
  kmActual                 Int @default(0)
  kmUltimoMantenimiento    Int @default(0)
  fechaUltimoMantenimiento DateTime?
  asignaciones             Asignacion[]
}

model Asignacion {
  id            Int @id @default(autoincrement())
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
  fotos         FotoAsignacion[]
}

model FotoAsignacion {
  id           Int @id @default(autoincrement())
  asignacionId Int
  tipo         String
  url          String
}


⸻

🧩 Backend (NestJS 11)

Dependencias principales:
	•	@nestjs/core 11.x
	•	@nestjs/jwt
	•	@nestjs/passport
	•	prisma + @prisma/client
	•	bcrypt
	•	class-validator
	•	class-transformer

Estructura:

backend/
 ├ src/
 │   ├ auth/
 │   ├ usuarios/
 │   ├ vehiculos/
 │   ├ asignaciones/
 │   ├ mantenimientos/
 │   ├ alertas/
 │   ├ prisma/
 │   └ common/
 ├ prisma/
 └ Dockerfile


⸻

🖥 Frontend (React 19 + Vite 6 + TailwindCSS 4)

Funcionalidad:
	•	Login simple
	•	Home por rol
	•	Formulario de asignación (mobile-first)
	•	Carga de fotos (File API)
	•	Firmas (signature pad)
	•	Dashboard (solo supervisor y admin)
	•	Fetch API con Axios

⸻

⚙️ docker-compose.yml (compactado)

services:
  api:
    build: ../backend
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/flota
    depends_on: [postgres]

  postgres:
    image: postgres:16
    ports: ["5433:5432"]
    environment:
      POSTGRES_PASSWORD: postgres

  pgadmin:
    image: dpage/pgadmin4
    ports: ["5050:80"]
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@tas.hn
      PGADMIN_DEFAULT_PASSWORD: admin123


⸻

💬 Integración con n8n

Usos:
	•	Enviar PDF a Slack
	•	Crear alertas automáticas
	•	Sincronizar empleados desde Odoo
	•	Recordatorios de mantenimiento
	•	Generar reportes de cambios

⸻

🚀 Qué sigue (Codex puede generar):
	1.	Generar NestJS 11 modules + controllers
	2.	Implementar Auth (JWT)
	3.	Implementar Roles Guard
	4.	Implementar CRUD Usuarios, Vehículos, Asignaciones
	5.	Generar frontend base
	6.	Conectar frontend ↔ backend
	7.	Integrar PDF
	8.	Integrar Slack vía n8n
	9.	Crear dashboard

⸻