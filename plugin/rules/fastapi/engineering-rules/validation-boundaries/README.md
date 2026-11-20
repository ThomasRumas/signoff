# Engineering rules — Theme: Validation boundaries

> **Scope:** request and response validation models in `presentation/http/`.

## Theme rules

### Boundary models

| # | Rule | Status |
|---|------|--------|
| 001 | [Define one boundary model per payload; map to internal types at the edge](001-boundary-models.md) | Approved |

## Out of scope for this theme

- Secrets inside models: see [security](../security/README.md)
- Validation error responses: see [error-handling](../error-handling/README.md)
