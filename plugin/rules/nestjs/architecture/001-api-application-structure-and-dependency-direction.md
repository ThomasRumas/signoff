# Decision: API Application Structure and Dependency Direction

## Status

Accepted

## Context

An API needs a predictable place for startup composition, shared infrastructure, feature behavior, and transport concerns. Without an explicit structure, controllers become responsible for business workflows, feature modules configure global infrastructure, and infrastructure details spread across the application.

The structure must support a small API without forcing layers that do not solve a current problem. It must also provide a clear path when a feature becomes more complex.

## Decision

NestJS API applications MUST use a composition root, shared cross-cutting modules, and feature modules organized by business capability.

A typical structure is:

```text
src/
  main.ts                 Application composition root
  app.module.ts           Root module composition
  core/                    Shared cross-cutting capabilities
    configuration/
    authentication/
    database/
  catalog/                 Business feature module
    catalog.module.ts
    catalog.controller.ts
    catalog.service.ts
    dto/
    errors/
```

The root module composes shared modules and business features. A feature module owns the transport entry points, application behavior, feature-specific contracts, and feature errors for its business capability.

Dependencies SHOULD flow from composition toward the capability that owns the behavior:

```text
main.ts
  |
  v
AppModule
  |
  +--> core modules
  |
  +--> feature modules
          |
          +--> controllers and transport contracts
          |
          +--> feature services and use cases
          |
          +--> owned persistence or integration boundary
```

## Rules

- `main.ts` MUST be the application composition root. It MUST be responsible for creating the Nest application and registering application-wide behavior.
- The root module MUST compose cross-cutting modules and feature modules. It MUST NOT contain feature workflows.
- Cross-cutting modules MAY provide capabilities such as configuration, authentication, persistence clients, or logging. They MUST NOT own business-specific workflows.
- Each business capability SHOULD have a feature module that owns its controllers, services, transport DTOs, and feature-specific errors.
- Controllers MUST remain transport-facing. They MAY bind input, select a response view, and translate an application result into an HTTP response. They MUST NOT own multi-step business workflows or infrastructure setup.
- Feature services MUST own the use cases and orchestration for their feature. A service MAY call a persistence client directly when the feature is small and the boundary remains clear.
- Generated clients, connection lifecycle, global middleware, secret acquisition, and process listeners MUST remain outside feature modules.
- A feature MUST NOT import another feature's private implementation details. Shared behavior SHOULD be moved to an explicitly owned shared capability or exposed through a stable application boundary.
- New architectural layers such as repositories, domain services, or adapters SHOULD be introduced only when they remove a real complexity or ownership problem.
- Modules MUST avoid circular dependencies. A circular dependency is a signal that ownership or the shared boundary needs to be reconsidered.

These rules define structure and dependency direction. Detailed rules for DTO validation, response contracts, persistence, authentication, and observability remain in the [API engineering rules](../engineering-rules/README.md).

## Rationale

A composition root makes application startup and global behavior visible. Feature modules keep business capabilities cohesive and make ownership discoverable. The structure also avoids premature layering: a small feature can use a service as its application and persistence boundary, while a larger feature can introduce narrower internal abstractions without changing the public module boundary.

## Alternatives Considered

### One global module for the entire API

Rejected because it makes feature ownership unclear and encourages unrelated controllers and services to depend on each other's internals.

### A fixed layered structure for every feature

Rejected because it introduces repositories, domain layers, or adapters before the application has a problem that requires them.

### A folder per technical layer across the whole application

Rejected as the default because it separates files that change together and makes business capability ownership harder to identify.

## Consequences

### Positive consequences

- Application startup and cross-cutting registration have one visible owner.
- Business capabilities have cohesive module boundaries.
- Feature code is easier to locate and review.
- The structure supports simple features without prohibiting more explicit boundaries when complexity grows.

### Negative consequences

- A feature that spans several shared capabilities still requires deliberate dependency design.
- The service boundary may need to be split when persistence, orchestration, or integration complexity increases.
- Module boundaries require review discipline; folder placement alone cannot prevent an invalid dependency.

## Exceptions and Review Triggers

A project MAY use a different structure when its framework, deployment model, or domain decomposition requires it. The alternative MUST preserve explicit composition, responsibility ownership, and dependency direction.

Introduce a narrower internal layer when a feature has multiple persistence models, several external integrations, independently testable domain rules, or repeated orchestration that cannot be kept clear in one service. Review this decision when the application becomes a multi-domain system or when feature-to-feature dependencies become common.

## Example

A `CatalogModule` contains `CatalogController`, `CatalogService`, request and response DTOs, and `ItemNotFoundError`. `AppModule` imports `CatalogModule` and shared configuration and database modules.

`CatalogController` accepts an HTTP request and calls `CatalogService`. `CatalogService` loads the item through the database boundary, applies the catalog use case, and returns a response projection. The controller does not create database clients, load configuration, or call the identity provider directly.

If catalog pricing later requires several external systems and independent business rules, the feature may introduce dedicated adapters or domain services inside `CatalogModule`. That change does not move the business workflow into `AppModule` or the controller.

## Related Guidance

- [API engineering rules](../engineering-rules/README.md)
