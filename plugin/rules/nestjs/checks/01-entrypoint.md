---
title: Application entrypoint (composition root).
globs: ["**/main.ts"]
sources:
  - architecture/001-api-application-structure-and-dependency-direction.md
  - architecture/003-api-runtime-and-process-boundaries.md
---
- MUST only compose the Nest application: validate runtime configuration before serving traffic, register global pipes, filters, middleware, listeners, API documentation, and lifecycle hooks.
- MUST NOT contain feature workflows or business logic.
- Global request behavior belongs here, not repeated in feature modules.
