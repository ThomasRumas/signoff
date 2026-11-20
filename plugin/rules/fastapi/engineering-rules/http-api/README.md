# Engineering rules — Theme: HTTP API

> **Scope:** the FastAPI HTTP surface — path operation functions, routers, dependency injection, response payloads.

## Theme rules

### Path operations and routers

| # | Rule | Status |
|---|------|--------|
| 001 | [Path operation functions stay thin](001-path-operation-functions.md) | Approved |
| 002 | [Route collaborators come from the container](002-dependency-injection.md) | Approved |
| 003 | [Routers mount through the version and tag surface](003-router-organization.md) | Approved |
| 004 | [Response payloads use the single annotation mechanism](004-response-payloads.md) | Proposed |

## Out of scope for this theme

- Streaming responses: see [streaming](../streaming/README.md)
- Request validation models: see [validation-boundaries](../validation-boundaries/README.md)
- Error responses: see [error-handling](../error-handling/README.md)
