# Activity log

## 2026-09-01

- Continued the existing Kiro-generated TypeScript project in Codex.
- Implemented the Express application, controller/service/repository layers, Supabase authentication middleware, Zod validation, and sanitized error responses.
- Added habit CRUD, completion logging with duplicate prevention, daily and weekly streak calculations, and dashboard analytics.
- Added request-scoped Supabase clients so all protected data queries run under the caller's JWT and Row Level Security.
- Added initial streak and schema tests, plus an API reference.
- The project uses Supabase rather than the earlier MongoDB direction. Run `scripts/database-schema.sql` in the Supabase SQL Editor before using the API.
