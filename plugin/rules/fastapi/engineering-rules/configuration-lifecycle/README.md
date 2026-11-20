# Engineering rules — Theme: Configuration and lifecycle

> **Scope:** settings sources in `infrastructure/config/`, composition wiring in `bootstrap.py`, and FastAPI startup/cleanup in `presentation/http/app.py`.

## Theme rules

### App settings and lifecycle

| # | Rule | Status |
|---|------|--------|
| 001 | [Read settings in one pass; own startup and cleanup](001-settings-and-lifecycle.md) | Approved |

## Out of scope for this theme

- Which concrete components the settings select: that stays in `bootstrap.py`,
  see [architecture](../../architecture/001-backend-layer-structure.md)
