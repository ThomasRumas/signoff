# Engineering rules — Theme: Error handling

> **Scope:** exception types, exception handlers, and HTTP error responses across the backend.

## Theme rules

### Failure paths

| # | Rule | Status |
|---|------|--------|
| 001 | [Raise domain errors, translate once at the boundary](001-domain-errors-and-handlers.md) | Approved |

## Out of scope for this theme

- Streaming error parts (protocol-level): see [streaming](../streaming/README.md)
- Validation error payloads: the boundary layer owns the shape, see
  [validation-boundaries](../validation-boundaries/README.md)
