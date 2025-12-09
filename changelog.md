# Changelog

## 2024-12-09

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
