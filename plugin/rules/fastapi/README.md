---
description: Python backends built with FastAPI as a layered modular monolith with a single composition root.
review-marker: fastapi-best-practices
---

# FastAPI Best Practices

Use this guide as the source of truth for backend decisions in FastAPI
projects. The architecture decision fixes the layer structure and the
dependency rule; the engineering rules govern how HTTP surfaces, validation
boundaries, errors, configuration, streaming, telemetry, security, and tests
are built inside that structure. This guide does not prescribe
persistence patterns, health endpoints, deployment topology, or performance
tuning (pagination, caching, N+1) — those areas have no code yet and get their
rules when they do.

## Workflow

1. Identify which architectural layer and project policy owns the behavior the
   change touches.
2. Load the engineering-rule family that owns the behavior and apply its
   decision; respect the layer dependency rule before adding any import.
3. Apply organization-specific requirements only when the project adopts
   them. They are not universal FastAPI defaults.
4. Treat decision status as meaningful. Do not turn a Proposed rule into a
   mandatory one, override an accepted decision, or hide a project-specific
   exception.
5. Verify at the smallest boundary that proves the change: unit, integration,
   or contract tests, plus the backend quality gates.

## Defaults

- Business rules live in application use cases and domain modules; FastAPI
  route functions only validate input, call one use case, and map output or
  errors.
- Pydantic validates untrusted boundaries (HTTP, TOML, environment, provider
  payloads) and converts once to internal frozen dataclasses; internal data
  stays framework-independent.
- Shared resources are constructed once in the composition root and reach
  routes only through `Annotated[..., Depends(...)]` dependencies.
- Expected failures are typed exceptions raised by the layer that can explain
  them and translated centrally at the HTTP boundary.
- Tests mirror architectural boundaries; tests never call a real model,
  network, or external service.

When a documented project context requires a different choice, make the
deviation explicit and limit it to the affected boundary.

## Engineering Rule Sets

- [Backend layer structure](architecture/001-backend-layer-structure.md)
- [HTTP API surface](engineering-rules/http-api/README.md)
- [Streaming responses](engineering-rules/streaming/README.md)
- [Validation boundaries](engineering-rules/validation-boundaries/README.md)
- [Error handling](engineering-rules/error-handling/README.md)
- [Configuration and lifecycle](engineering-rules/configuration-lifecycle/README.md)
- [Observability](engineering-rules/observability/README.md)
- [Security defaults](engineering-rules/security/README.md)
- [Testing strategy](engineering-rules/testing-strategy/README.md)
