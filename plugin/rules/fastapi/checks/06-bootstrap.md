---
title: Bootstrap composition root (concrete wiring and startup).
globs: ["**/bootstrap.py"]
sources:
  - architecture/001-backend-layer-structure.md
  - engineering-rules/configuration-lifecycle/README.md
---
- `bootstrap.py` is the composition root and the only module that knows concrete implementations; it reads settings in one pass (TOML + environment overrides) and wires ports into `app.state`.
- Flag any other module importing infrastructure concretes directly, and any concrete built outside `bootstrap.py` or tests.
- No route handlers, no per-request settings resolution, no clients opened at import time; connect/close happens in lifespan.
- Startup side effects (logging provider setup, runtime state sync) run once here, before app creation; a plain startup log line is the sole allowed `print`.
