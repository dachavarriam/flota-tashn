# Changelog

## 2026-02-06

### Fix: Permisos de Rol ENCARGADO y Configuración de Producción
- **fix: corregido error de permisos para el rol ENCARGADO**
  - Se habilitó el acceso al endpoint `GET /api/usuarios` para los roles `ENCARGADO` y `SUPERVISOR`.
  - Esto soluciona el problema donde los dropdowns de conductores y vehículos no cargaban en el formulario de asignaciones.
  - Permite que el flujo de creación de asignaciones y carga de fotos funcione correctamente para encargados.
- **chore: actualización de configuraciones para producción**
  - Se actualizó el `main.ts` del backend para permitir CORS desde `https://flota.tashonduras.com`.
  - Se cambió el `baseURL` del frontend a una ruta relativa (`/api`) para compatibilidad con Nginx en producción.
  - Se eliminaron credenciales de base de datos hardcodeadas en `docker-compose.yml` para mejorar la seguridad.
  - Se añadió `host.docker.internal` al `extra_hosts` del backend para facilitar la conexión con servicios locales si es necesario.

## 2026-02-05

### Feature: Restricciones de Roles y Mejoras en Gestión
- **feat: implementar restricciones de roles adicionales**
  - Refuerzo de seguridad en controladores para asegurar que solo ADMIN/SUPERVISOR puedan realizar acciones críticas.
- **feat: limpieza de asignaciones y mejoras en vehículos**
  - Optimización de la lógica de limpieza de datos.
  - Mejoras en la visualización y gestión de la flota en el frontend.
- **chore: limpieza del repositorio**
  - Eliminación de scripts de mantenimiento obsoletos (`backend/limpiar-db.ts`).

## 2026-02-02

### Infrastructure: Migración a Docker Compose y Despliegue en Producción
- **feat: implementación de Docker Compose para despliegue completo**
  - Orquestación de contenedores para backend (NestJS) y frontend (Vite/Nginx).
  - Configuración de persistencia de datos para fotos y firmas mediante volúmenes.
- **fix: compatibilidad con Debian Slim**
  - Ajustes en el entorno del backend para resolver errores de ejecución (Err 139) en servidores Debian.
- **chore: despliegue exitoso**
  - Aplicación funcional y corriendo en `https://flota.tashonduras.com`.

## 2024-12-11

### Feature: PDF Report Generation & Slack Integration

#### Backend - PDF Generation (PdfService)
- **feat: implemented robust PDF generation service using PDFKit**
  - **Design:** Professional, single-column layout with corporate branding (TAS colors & logo).
  - **Content:** Includes vehicle info, trip details, checklist/levels status, damage reports, and driver signature.
  - **Logic:** implemented "Zebra Striping" for readability and smart page break handling to prevent content overflow.
  - **Signature:** Robust path resolution to embed driver signature image regardless of server execution context.
  - **Footer:** Automatic page numbering and generation timestamp on every page.
  - **Fixes:** Solved multiple layout issues (extra blank pages, misalignment, centering bugs) by switching to absolute positioning logic.

#### Backend - Slack/n8n Integration (SlackService)
- **feat: automated PDF reporting via n8n webhook**
  - Configured `SlackService` to send generated PDF files to an n8n webhook endpoint.
  - Automatic trigger: Sends report immediately upon assignment signature (when `numeroRegistro` is generated).
  - Data payload: Includes PDF file (multipart/form-data) + metadata (vehicle, driver, date, registry number).
  - Fallback: Graceful error handling if webhook is not configured.

#### Frontend - Asignaciones UI
- **fix: removed manual "Send to Slack" button** as the process is now fully automated.
- **feat: improved "Export PDF" button visibility** by increasing icon size.

#### Files Created/Modified
- `backend/src/asignaciones/pdf.service.ts`: Complete rewrite for professional layout.
- `backend/src/asignaciones/slack.service.ts`: Fixed type errors and improved error handling.
- `backend/src/asignaciones/asignaciones.service.ts`: Added auto-trigger logic for PDF generation on update.
- `frontend/flota-tas/src/components/AsignacionesList.tsx`: UI cleanup.
- `backend/assets/logo.png`: Added corporate logo asset.

### Feature: Módulo Completo de Mantenimientos
...

#### Backend - Mantenimientos CRUD
- **feat: added Mantenimiento model to Prisma schema**
  - Fields: vehiculoId, fecha, tipo, descripcion, taller, costo, kmActual, proximoMantenimiento, observaciones
  - Cascade delete relationship with Vehiculo
  - Added taller field for workshop tracking

- **feat: created mantenimientos module with full CRUD**
  - Service with create, findAll, findByVehiculo, findOne, update, remove methods
  - Validates kmActual >= vehicle's current km
  - Automatically updates vehicle's kmActual and kmUltimoMantenimiento after maintenance
  - Controller with role-based permissions (CREATE/UPDATE: ADMIN, SUPERVISOR, ENCARGADO | DELETE: ADMIN only)
  - Query param support: GET /mantenimientos?vehiculoId=X

#### Frontend - Mantenimientos UI
- **feat: complete Mantenimientos module with List and Form**
  - MantenimientosList: Grid cards (responsive 1/2/3 columns)
  - Shows: vehiculo, tipo, fecha, kmActual, costo, taller, próximo mantenimiento
  - Role-based edit/delete buttons
  - MantenimientoForm: Full form with vehicle selector, date, tipo, km, taller, costo, descripción

- **feat: integrated in main navigation**
  - Added "Servicio" tab in floating dock (Wrench icon)
  - Accessible to all authenticated users (create/edit restricted by role)

#### Files Created/Modified
- Backend: schema.prisma, mantenimientos (service, controller, module, DTOs)
- Frontend: types, API client, components (List, Form), page, App.tsx navigation

## 2024-12-11

### Feature: Dashboard with Role-Based Metrics & Quick Access

#### Backend - User Assignments Endpoint
- **feat: added GET /usuarios/:id/asignaciones endpoint**
  - Returns assignments received (as conductor) and assigned (as encargado)
  - Includes related vehiculo, usuario/encargado, and fotos data
  - Ordered by fecha DESC for chronological display
  - Protected with JwtAuthGuard (authenticated users only)

#### Frontend - Dashboard Implementation
- **feat: created comprehensive Dashboard/HomePage component**
  - Replaces previous direct-to-module landing after login
  - New "Inicio" button (Home icon) in floating dock navigation
  - Dashboard set as default landing page (currentPage = 'dashboard')

- **feat: role-based dashboard views**
  - **ADMIN**: Full system metrics (all vehicles, all assignments, all users)
  - **SUPERVISOR/ENCARGADO**: System-wide metrics (all vehicles, all assignments)
  - **USUARIO**: Personal metrics only (their vehicles, their assignments)

- **feat: metrics widgets**
  - Flota/Vehículos: Total, disponibles, en uso
  - Asignaciones: Total, activas, en revisión
  - Usuarios: Total registered (ADMIN only)
  - Mantenimiento: Vehicles needing service (>5000 km)
  - Alertas: Vehicles with reported damages
  - Color-coded badges (green=available, yellow=warning, red=danger)

- **feat: quick access cards**
  - Nueva Asignación → Navigate to AsignacionesPage
  - Ver Flota → Navigate to VehiculosPage
  - Usuarios → Navigate to UsuariosPage (ADMIN only)
  - Interactive with hover effects and gradients
  - Click navigation via onNavigate prop

- **feat: activity feed**
  - Recent Assignments (last 5)
  - Shows estado, fecha, vehiculo, conductor
  - Damage badges for assignments with tieneDanos flag
  - Role-aware title: "Mis Asignaciones Recientes" for USUARIO

- **feat: maintenance alerts**
  - Lists vehicles >5000 km since last maintenance
  - Shows km overdue or km since service
  - Current km display
  - Yellow alert styling with warning icons
  - Filtered to user's vehicles for USUARIO role

- **feat: personalized welcome messages**
  - "Panel de Control - Gestión de Flota TAS" (ADMIN)
  - "Panel de Control - Vista General" (SUPERVISOR/ENCARGADO)
  - "Mi Panel Personal" (USUARIO)

- **feat: responsive design**
  - Mobile-first layout
  - Grid breakpoints at 640px, 1024px
  - Loading state with animated spinner
  - Empty states with helpful messages

#### Files Created/Modified
- Created: `/frontend/flota-tas/src/pages/DashboardPage.tsx`
- Created: `/frontend/flota-tas/src/pages/DashboardPage.css`
- Modified: `/frontend/flota-tas/src/App.tsx` - Added dashboard routing and "Inicio" nav
- Modified: `/backend/src/usuarios/usuarios.service.ts` - Added getAsignaciones()
- Modified: `/backend/src/usuarios/usuarios.controller.ts` - Added GET :id/asignaciones route

#### Testing & Verification
- ✅ ADMIN sees all system metrics and all assignments
- ✅ SUPERVISOR/ENCARGADO sees system metrics (no user count)
- ✅ USUARIO sees only their personal metrics and assignments
- ✅ Quick access cards navigate correctly
- ✅ Maintenance alerts calculated correctly (>5000 km)
- ✅ Damage badges show for tieneDanos assignments
- ✅ Responsive layout works on mobile and desktop
- ✅ Dashboard is default landing page after login

## 2024-12-11

### Feature: Vehicle Availability & Assignment Validations

#### Backend - Validation & Availability Logic
- **feat: added vehicle availability check in VehiculosService**
  - Modified `findAll()` to include active assignments (ACTIVA/EN_REVISION states)
  - Added `disponible` flag to vehicle responses
  - Added `asignacionActiva` field with assignee and state info
- **feat: added validation to prevent duplicate assignments**
  - Added check in AsignacionesService create() method
  - Blocks new assignments for vehicles with ACTIVA or EN_REVISION state
  - Returns clear error message with current assignee name
- **feat: added kilometraje validations**
  - Made kmSalida required in CreateAsignacionDto
  - Added validation: kmRetorno must be greater than kmSalida
  - Clear error messages for validation failures

#### Frontend - UI Updates & Validations
- **feat: updated VehiculosList to show availability status**
  - Visual differentiation for available vs. in-use vehicles
  - Green badge for "Disponible", red badge for "En Uso"
  - Red gradient background for unavailable vehicles
  - Shows current assignee and state when vehicle is in use
  - Added CSS classes: `.badge-disponible`, `.badge-en-uso`, `.no-disponible`
- **feat: updated AsignacionForm with validations**
  - Made kmSalida required field (marked with *)
  - Added client-side validation for kmRetorno > kmSalida
  - Disabled unavailable vehicles in vehicle selector dropdown
  - Shows "(En Uso)" label for unavailable vehicles in dropdown
  - Clear error messages displayed to user on validation failures
- **fix: updated Vehiculo TypeScript interface**
  - Added `disponible?: boolean` field
  - Added `asignacionActiva` field with assignment details
  - Added `asignaciones` array for backend compatibility

#### Testing & Verification
- ✅ Vehicles marked as unavailable when ACTIVA or EN_REVISION
- ✅ Cannot create new assignment for vehicle already in use
- ✅ kmSalida is required for new assignments
- ✅ kmRetorno must be greater than kmSalida
- ✅ Visual feedback in VehiculosList for availability
- ✅ Dropdown prevents selection of unavailable vehicles

## 2024-12-11

### Feature: Photo Capture & Gallery for Damage Documentation

#### Frontend - Photo Gallery Component
- **feat: created PhotoGallery component for damage documentation**
  - Implemented photo capture from camera or gallery
  - Added tipo selector (frontal, trasera, lateral_izq, lateral_der, dano)
  - Created modern grid layout with photo cards
  - Added delete functionality for photos
  - Responsive design for mobile and desktop
  - Component files: PhotoGallery.tsx and PhotoGallery.css
  - Modern gradient buttons: blue to dark blue (camera), red to dark red (gallery)
- **feat: integrated PhotoGallery into AsignacionForm**
  - Shows when damage report is activated (allowDamageReport flag)
  - Displays existing photos when editing assignments
  - Automatically uploads new photos on save
  - Read-only mode blocks photo editing when not in damage report mode
  - Removed old unused photo section with non-functional upload slots
  - Photos open in new tab on click for full-size viewing
- **fix: photo URL construction and display**
  - Fixed photo URLs to properly construct server base URL
  - Removed `/api` suffix correctly using regex replace
  - Photos now load and display correctly from backend static assets

#### Backend - Photo Upload & Storage
- **feat: enhanced photo upload endpoint with tipo support**
  - Modified `/asignaciones/:id/upload-photos` to accept photo tipos
  - Added automatic database persistence for uploaded photos
  - Created `addPhotos()` method in AsignacionesService
  - Added `deletePhoto()` method for individual photo deletion
  - Added DELETE endpoint `/asignaciones/photos/:photoId`
  - Enhanced logging for photo operations
- **fix: static file serving path resolution**
  - Fixed path in main.ts to use `join(__dirname, '..', '..', 'uploads')`
  - Correctly resolves from `dist/src/main.js` to backend root `uploads/` folder
  - Photos now serve correctly with HTTP 200 response

#### Features & Verification
- ✅ Capture photos from camera or select from gallery
- ✅ Categorize photos by type (frontal, trasera, laterales, daños)
- ✅ Upload multiple photos at once
- ✅ Display photos in modern grid with tipo badges and color coding
- ✅ Delete individual photos (only when allowDamageReport is active)
- ✅ Photos persist in database (FotoAsignacion table)
- ✅ Automatic upload on assignment save
- ✅ Load existing photos when editing
- ✅ Photos display correctly with proper URLs
- ✅ Click to open photos in full size
- ✅ Read-only mode prevents editing when assignment is ACTIVA

### Critical Bug Fixes - Asignaciones Form & Estado Flow

#### Frontend - AsignacionForm Critical Fixes
- **fix: resolved stale closure bug causing formData to become empty on save**
  - Implemented useRef pattern to maintain stable reference to submit handler
  - Added `submitHandlerRef` to prevent dock action buttons from capturing stale state
  - Fixed component re-mounting issue that was clearing form state
  - Solution: Lines 135, 395-397, 425 in AsignacionForm.tsx
- **fix: removed re-initialization bug in useEffect**
  - Added `loadedAsignacionId` tracking to prevent useEffect from clearing formData on updates
  - Form data now persists correctly throughout edit lifecycle
- **fix: parent component timing issue**
  - Modified `handleSuccess` in AsignacionesPage.tsx to delay unmounting with setTimeout
  - Prevents form component from unmounting during save operation
- **chore: cleaned up all debugging console.logs**
  - Removed verbose logging from AsignacionForm.tsx
  - Kept only essential production logs for monitoring

#### Backend - Automatic Estado Flow Implementation
- **feat: implemented automatic estado transitions**
  - ACTIVA → EN_REVISION: Auto-transition when kmRetorno is provided (vehicle returned)
  - FINALIZADA: Manual transition by supervisor after damage review
  - CANCELADA: Manual transition if assignment is cancelled
  - Added intelligent logic in asignaciones.service.ts update method (lines 119-131)
- **fix: checklist and niveles persistence**
  - Added missing fields to UpdateAsignacionDto: checklist, niveles, observaciones, tieneDanos
  - Data now persists correctly on updates
- **fix: numeroRegistro generation on update**
  - Modified update() method to generate sequential registration numbers (TFL-0001, TFL-0002...)
  - Numbers generated when firmaUsuario is added and numeroRegistro doesn't exist
  - Added logging for numero registro generation (line 110)
- **fix: TypeScript compilation error**
  - Removed invalid firmaUsuario access in create() method
  - Signature is always uploaded via separate update() call
- **feat: enhanced logging for estado transitions**
  - Added production-ready logs for auto-transitions and manual transitions
  - Format: `🔄 Auto-transition: Asignacion #7 ACTIVA → EN_REVISION (kmRetorno provided)`
  - Format: `✅ Manual transition: Asignacion #7 EN_REVISION → FINALIZADA`

#### Backend - Schema Updates
- **feat: added EN_REVISION estado to Prisma schema**
  - Migration: 20251211000747_add_en_revision_and_tiene_danos
  - Updated EstadoAsignacion enum to include EN_REVISION state
  - Added tieneDanos boolean field to track damage status

#### Testing & Verification
- ✅ Verified complete estado flow: ACTIVA → EN_REVISION → FINALIZADA
- ✅ Verified checklist items persist correctly
- ✅ Verified niveles de fluidos persist correctly
- ✅ Verified numeroRegistro generates sequentially
- ✅ Verified formData saves correctly without becoming empty
- ✅ Verified TypeScript compiles without errors

## 2024-12-09

### Modified by Gemini (UI/UX Overhaul & Features)

#### Frontend - UI/UX Redesign
- feat: implemented **Floating Dock Navigation** replacing traditional navbar
- feat: redesigned **VehiculosList** with modern "Weather Card" style and responsive grid
- feat: redesigned **UsuariosList** and **AsignacionesList** with iOS-style cards and quick filters
- feat: implemented "Burger" style header for **AsignacionForm** with overlapping card effect
- feat: improved form controls: Horizontal Fuel Slider with dynamic colors, Cyclic Fluid Buttons, and Toggle Switches for checklist
- style: unified "Add" buttons to floating circular action buttons
- style: implemented containerized layout (`main-viewport`) for better responsiveness on all devices

#### Frontend - New Features
- feat: integrated **Signature Capture** using `react-signature-canvas` in a full-screen modal
- feat: added support for dynamic vehicle images based on license plate (`/public/vehiculos/[PLACA].png`)
- feat: added context-aware action dock (Cancel/Sign) when inside forms
- feat: implemented signature upload to server (converts base64 to File and uploads)
- feat: added helper functions for base64 to File conversion in AsignacionForm
- refactor: streamlined CSS for consistency across all modules

#### Frontend - UI/UX Improvements
- fix: header now has rounded corners and matches background color (#f2f4f8)
- fix: header width now matches content width for consistent layout
- fix: Cancel button in dock now displays white background with red text (forced with !important)
- style: header is now sticky with proper spacing (top: 1rem, border-radius: 24px)

#### Backend
- feat: implemented complete CRUD for **Asignaciones** module (DTOs, Service, Controller, Guards)
- feat: implemented complete CRUD for **Usuarios** module (finalized logic and DTOs)
- feat: added `test-asignaciones.sh` script for automated API testing of assignments
- chore: installed `@nestjs/mapped-types` to support PartialType in DTOs
- chore: updated `CreateAsignacionDto` and `UpdateAsignacionDto` to fix class duplications and strict initialization
- fix: removed `SUPERUSER` role from controller decorators to align with requirements
- feat: implemented file upload system with multer for photos and signatures
- feat: added AsignacionesUploadController with endpoints for signature and photo uploads
- feat: configured static file serving for /uploads directory
- chore: created upload directories (uploads/signatures and uploads/photos)

### Backend

- feat: implemented complete CRUD for vehiculos module (DTOs, service, controller, guards)
- feat: added validation for unique placa and conflict prevention on delete with asignaciones
- chore: fixed Prisma adapter connection using individual env vars (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)
- chore: added dotenv config to main.ts for proper environment variable loading
- feat: seeded database with 7 real TAS Honduras vehicles (HBP4760, HBP4761, HDL2845, HBO3747, JAK6227, HBO3748, HDL3848)
- test: created comprehensive CRUD test script for vehiculos endpoints
- chore: changed backend port to 4001 for testing
- fix: enabled CORS for frontend with credentials support

### Frontend

- feat: implemented complete CRUD UI for vehiculos (list, create, edit, delete)
- feat: added VehiculosList component with search and table display
- feat: added VehiculoForm component for create/edit with validation
- feat: added VehiculosPage to manage list and form views
- feat: updated App.tsx with navbar and navigation after login
- chore: added auth token interceptor to API client
- feat: created TypeScript types for Vehiculo entity
- fix: changed TypeScript imports to type-only imports for interfaces in AuthContext
- chore: updated API URL in .env to use server IP for network access
- test: verified complete CRUD functionality (create, read, update, delete, search)

## 2024-12-03

- chore: added root .gitignore to unify ignores and prep clean repo
- chore: removed legacy nested backend/api scaffold to rebuild backend at backend/
- docs: updated compact.md with current scope, schema, and roadmap
- chore: added git hooks (pre-commit changelog enforcement, pre-push lint/test stubs)
- chore: set core.hooksPath to .githooks for local enforcement
- feat: scaffolded NestJS 11 backend structure in backend/ with modules placeholders and prisma service
- chore: added backend configs (tsconfig, nest-cli, eslint) and env example
- feat: wired JWT auth (email/password) with Prisma + bcrypt, login/me endpoints, guards/decorators
- chore: added Prisma config for v7, generate script, and seed script for admin user
- feat: basic usuarios endpoints (create/list) with role guard; jwt strategy added
- feat: frontend login demo with axios client, AuthProvider, and env example for API URL
- chore: configured PrismaClient with @prisma/adapter-pg + pg pool and updated seed to use adapter
- chore: ran `prisma migrate dev --name init` and seeded admin on local DB
- chore: added typings for pg/bcrypt and fixed TS strict issues in DTOs/auth/prisma
- feat: frontend login usa logo TAS (LogoTAS_circular.png) en el header
