🚗 Proyecto: flota-tashonduras — Sistema de Asignación y Control de Flota Vehicular

Estado: Desarrollo inicial
Propósito: Crear un sistema digital para la gestión completa de asignaciones, inspecciones, historial, mantenimiento y alertas, accesible desde móvil y escritorio, integrado con Postgres, n8n y Slack, con backend NestJS 11 y frontend React 19.

⸻

🧱 Arquitectura General

Frontend (React 19 + Vite + TailwindCSS 4)
     ↕ REST API
Backend (NestJS 11 + Prisma ORM)
     ↕
PostgreSQL 16
     ↕
n8n (Slack notifications + PDF/alert workflows)

Infra: docker-compose (api:4000, postgres:5432, opcional pgadmin), futuro Cloudflare Tunnel.

⸻

🎯 Módulos principales

1. Autenticación
   • Login: correo + contraseña
   • JWT con roles (USUARIO, ENCARGADO, SUPERVISOR, ADMIN)

2. Vehículos
   • Registro/edición, placa, marca, modelo, tipo
   • KM actual, último mantenimiento, historial

3. Asignaciones
   • Vehículo → Conductor → Encargado
   • Checklist, niveles (combustible/aceite/coolant)
   • Fotos (rallones, abolladuras, interior, exterior)
   • Firmas (conductor, encargado)
   • Observaciones, PDF, envío a Slack, historial

4. Mantenimientos
   • Fecha, descripción, costo
   • Próximo mantenimiento por KM
   • Alertas automáticas vía n8n

5. Alertas
   • Daños, niveles bajos, mantenimientos vencidos, faltas de herramientas
   • Envío automático a Slack

6. Dashboard Web
   • Estado de flota, historial por vehículo, reportes por encargado
   • Filtros por fecha/usuario/vehículo, actividades recientes

⸻

📐 Base de Datos (Prisma)

model Usuario {
  id       Int      @id @default(autoincrement())
  nombre   String
  correo   String   @unique
  password String
  rol      Rol
  activo   Boolean  @default(true)
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
  id             Int      @id @default(autoincrement())
  vehiculoId     Int
  usuarioId      Int
  encargadoId    Int
  fecha          DateTime @default(now())
  horaSalida     String?
  kmSalida       Int?
  uso            String?
  checklist      Json?
  niveles        Json?
  observaciones  String?
  pdfUrl         String?
  firmaUsuario   String?
  firmaEncargado String?
  fotos          FotoAsignacion[]

  vehiculo    Vehiculo @relation(fields: [vehiculoId], references: [id])
  usuario     Usuario  @relation("UsuarioAsignaciones", fields: [usuarioId], references: [id])
  encargado   Usuario  @relation("EncargadoAsignaciones", fields: [encargadoId], references: [id])
}

model FotoAsignacion {
  id           Int    @id @default(autoincrement())
  asignacionId Int
  tipo         String
  url          String
  asignacion   Asignacion @relation(fields: [asignacionId], references: [id])
}

⸻

🧩 Backend (NestJS 11)

Dependencias principales: @nestjs/core/common/platform-express, @nestjs/jwt, @nestjs/passport, passport-jwt, bcrypt, class-validator, class-transformer, prisma + @prisma/client.

Estructura target (sin subcarpeta api):
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
 ├ package.json
 └ Dockerfile

⸻

🖥 Frontend (React 19 + Vite 6 + TailwindCSS 4)

Funcionalidad:
 • Login + rutas protegidas por rol
 • Home por rol
 • Formulario de asignación (mobile-first): niveles, checklist, fotos, firmas, observaciones
 • Dashboard (supervisor/admin)
 • Axios client + estado con Context/Zustand

⸻

⚙️ docker-compose.yml (compactado)

services:
  api:
    build: ./backend
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
 • Enviar PDF/alertas a Slack
 • Crear alertas automáticas
 • Sincronizar empleados desde Odoo
 • Recordatorios de mantenimiento
 • Generar reportes de cambios

⸻

🚀 Qué sigue (Codex puede generar):
 1. Limpieza repo + .gitignore raíz
 2. NestJS 11 base en backend/ sin subcarpeta api
 3. Prisma schema + migración inicial + seed admin
 4. Auth (JWT + roles + guards)
 5. CRUD Usuarios, Vehículos, Asignaciones (con fotos), Mantenimientos, Alertas
 6. Integración n8n (Slack/PDF)
 7. Frontend base + login + rutas protegidas
 8. Formulario de asignación + dashboard
 9. Docker compose/api/frontend

⸻
