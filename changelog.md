# Changelog

## 2024-12-03
- chore: added root .gitignore to unify ignores and prep clean repo
- chore: removed legacy nested backend/api scaffold to rebuild backend at backend/
- docs: updated compact.md with current scope, schema, and roadmap
- chore: added git hooks (pre-commit changelog enforcement, pre-push lint/test stubs)
- chore: set core.hooksPath to .githooks for local enforcement
- feat: scaffolded NestJS 11 backend structure in backend/ with modules placeholders and prisma service
- chore: added backend configs (tsconfig, nest-cli, eslint) and env example
