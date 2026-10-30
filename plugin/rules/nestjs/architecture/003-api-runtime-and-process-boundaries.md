# Decision: API Runtime and Process Boundaries

## Status

Accepted

## Context

An API process must establish configuration, shared infrastructure, global request behavior, and listeners before it accepts traffic. Runtime concerns become difficult to reason about when feature modules start servers, load secrets, or implement infrastructure health checks themselves.

An authenticated API also needs a liveness boundary that infrastructure can call without presenting business credentials. Liveness must answer whether the process is available, not whether every downstream dependency or business capability is healthy.

## Decision

The application composition root owns startup order, process lifecycle, global registration, and listener creation.

The architectural startup sequence is:

```text
Runtime configuration acquisition
        |
        v
Configuration validation
        |
        v
Nest application composition
        |
        v
Global pipes, middleware, and cross-cutting registration
        |
        v
API documentation and listener setup
        |
        v
Traffic acceptance
```

The primary API process owns authenticated business endpoints. When the API requires authentication by default, liveness SHOULD be exposed through a separate application or listener with an intentionally unauthenticated endpoint.

The liveness boundary reports process availability only. Readiness, dependency checks, telemetry, secret providers, and deployment behavior are separate concerns governed by the relevant engineering rules.

## Rules

- The composition root MUST establish runtime configuration and validate it before the application accepts traffic.
- The composition root MUST create the Nest application, register global cross-cutting behavior, and create listeners.
- Feature modules MUST NOT start servers, load deployment secrets, install application-wide middleware, or own process shutdown.
- Global request behavior MUST be registered at the application boundary rather than repeated in individual feature modules.
- The authenticated API listener MUST remain the owner of business endpoints and their API contract.
- A liveness endpoint MUST be minimal, unauthenticated when required by the infrastructure boundary, and independent of business workflows.
- Liveness MUST NOT be used as an implicit readiness or dependency-health contract. A readiness contract requires its own documented decision and implementation rules.
- The process SHOULD be stateless between requests. Durable state belongs to an explicitly owned external boundary such as a database or managed session service.
- API documentation setup and listener exposure MUST be composed at startup. Feature modules MAY contribute contract metadata but MUST NOT create their own listeners.
- Startup failures MUST prevent the process from advertising a ready API. The mechanism for configuration validation, secret loading, logging, and deployment handling belongs to the relevant engineering rules.

These rules define runtime ownership only. Detailed configuration, observability, health checks, and deployment practices remain in the [API engineering rules](../engineering-rules/README.md).

## Rationale

A single composition root makes startup order visible and prevents feature code from depending on process mechanics. A separate liveness boundary allows orchestration infrastructure to determine whether the process is running without weakening the authenticated API boundary.

Keeping liveness distinct from readiness also prevents a simple process check from becoming an undocumented promise about database, identity, or external-service availability.

## Alternatives Considered

### Allowing every feature module to configure its own runtime

Rejected because startup order and global behavior would be distributed across business code, making the process difficult to operate and test.

### Making liveness part of the authenticated API only

Rejected when authentication is mandatory because infrastructure health checks should not depend on business credentials or identity-provider availability.

### Using liveness as a full dependency health check

Rejected because it couples process availability to downstream systems and creates an ambiguous operational contract. Dependency readiness requires explicit ownership and semantics.

## Consequences

### Positive consequences

- Startup order and process ownership are explicit.
- Feature modules remain independent of deployment and listener mechanics.
- Infrastructure can check process liveness without authenticating against business endpoints.
- Readiness and dependency health can evolve as separate operational contracts.

### Negative consequences

- A separate health application or listener adds a small amount of runtime composition.
- Port, routing, and deployment configuration must keep the API and liveness boundaries coordinated.
- More advanced lifecycle or readiness behavior requires an additional documented decision.

## Exceptions and Review Triggers

A project MAY expose liveness through the primary API listener when its authentication model and infrastructure requirements make that boundary safe and explicit. It MUST still keep liveness independent of business workflows.

Review this decision when the process becomes stateful, when multiple independently scaled runtimes are introduced, when readiness must include dependency checks, or when startup and shutdown require coordinated orchestration across processes.

## Example

An API creates its authenticated application first and exposes business routes on the primary listener. It also creates a small health application with an unauthenticated `/info` endpoint that returns a process-level success response.

The health application does not query the catalog database, validate a user token, or execute a business use case. If the project later needs database readiness, it adds a separately defined readiness endpoint and documents its dependency semantics rather than changing the meaning of `/info`.

## Related Guidance

- [API engineering rules](../engineering-rules/README.md)
