---
title: Backend Python defaults (layers, settings, logging, secrets, packages).
globs: ["**/*.py"]
sources:
  - README.md
  - architecture/001-backend-layer-structure.md
---
- The dependency rule holds: presentation -> application -> domain; infrastructure -> application -> domain; only `bootstrap.py` imports concretes.
- Settings come from the single configuration path resolved at startup and reach layers via ports/dependencies; flag scattered `os.getenv` in `src/`.
- `logging.getLogger(__name__)` is the logger source; no `print` in `src/` (exception: `bootstrap.py` startup line); log lines keep a stable `key=value` shape.
- Secrets stay out of plain model fields: any secret-bearing field carries `repr=False` (or `SecretStr`) and never enters logs.
- New packages exist only as code moves into them; flag empty directory scaffolding and compatibility wrappers kept "for later".
- `pyproject.toml` stays the single source of tool configuration (`ty`, `ruff`, `pytest`); flag per-tool config files unless a tool requires them.
