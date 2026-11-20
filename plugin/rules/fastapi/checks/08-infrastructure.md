---
title: Infrastructure adapters (config loading, HTTPX catalogs, SDK builders).
globs: ["**/infrastructure/**/*.py"]
sources:
  - architecture/001-backend-layer-structure.md
  - engineering-rules/configuration-lifecycle/README.md
---
- Infrastructure imports the standard library, its own libraries, and application/domain ports only; it MAY NOT import presentation.
- Concrete adapters (HTTPX catalogs, TOML loaders, agent builders) are instantiated in `bootstrap.py` only; flag module-import-time client creation.
- Settings load in one explicit pass through the loader; flag scattered `os.getenv` in infrastructure modules.
- Long-lived clients (HTTPX, gateway) are closed via lifespan; flag clients opened and abandoned per request.
- Secrets from configuration are never logged or embedded in error payloads.
