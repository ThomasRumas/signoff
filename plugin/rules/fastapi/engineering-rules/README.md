# Engineering rules — Index

> **Scope:** all engineering rules for this project. One table per theme: each rule is one file, one decision.

## Themes

- [http-api](http-api/README.md) — path operation functions, routers, dependency injection, response payloads
- [streaming](streaming/README.md) — streaming responses and the Vercel AI SDK data stream format
- [validation-boundaries](validation-boundaries/README.md) — request and response validation at the framework boundary
- [error-handling](error-handling/README.md) — domain failures, structured errors, and HTTP error responses
- [configuration-lifecycle](configuration-lifecycle/README.md) — settings sources, application startup, and dependency cleanup
- [observability](observability/README.md) — logging and request tracing through structured output
- [security](security/README.md) — secret handling and secrets in validation models
- [testing-strategy](testing-strategy/README.md) — test layers, external seams, hypothesis properties, and quality gates

## Rule index

| Theme | Rule | Status |
|-------|------|--------|
| [http-api](http-api/README.md) | 001 — Path operation functions stay thin | Approved |
| [http-api](http-api/README.md) | 002 — Route collaborators come from the container | Approved |
| [http-api](http-api/README.md) | 003 — Routers mount through the version and tag surface | Approved |
| [http-api](http-api/README.md) | 004 — Response payloads use the single annotation mechanism | Proposed |
| [streaming](streaming/README.md) | 001 — Use the framework's streaming encoding; never hand-encode the protocol | Approved |
| [validation-boundaries](validation-boundaries/README.md) | 001 — Define one boundary model per payload; map to internal types at the edge | Approved |
| [error-handling](error-handling/README.md) | 001 — Raise domain errors, translate once at the boundary | Approved |
| [configuration-lifecycle](configuration-lifecycle/README.md) | 001 — Read settings in one pass; own startup and cleanup | Approved |
| [observability](observability/README.md) | 001 — Log structured records with request context | Proposed |
| [security](security/README.md) | 001 — Secrets never sit in plain model fields | Approved |
| [testing-strategy](testing-strategy/README.md) | 001 — Contract tests drive `create_app`; properties pin framework-facing behaviour | Approved |
| [testing-strategy](testing-strategy/README.md) | 002 — Hypothesis, mocks, and the quality gates | Approved |
