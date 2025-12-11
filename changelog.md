# Changelog

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
