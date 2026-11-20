---
title: App factory (`create_app`, middleware, exception handlers, lifecycle).
globs: ["**/presentation/http/app.py"]
sources:
  - engineering-rules/configuration-lifecycle/README.md
  - engineering-rules/error-handling/README.md
  - architecture/001-backend-layer-structure.md
---
- `create_app` is the FastAPI app factory: it accepts injected ports and settings and mounts routers via `include_router` with prefix and tags; it contains no route handlers itself.
- CORS middleware and settings reads stay here for framework settings (CORS origins, OTEL) with documented defaults; flag any other environment read in this module.
- Long-lived resources connect and close through FastAPI lifespan (or documented startup/shutdown registration); flag `@app.on_event` and clients opened at import time.
- `RequestValidationError` and domain error handlers are registered here, each translating once to its declared structured payload with `status_code` and error model.
