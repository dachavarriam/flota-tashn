# Changelog

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
