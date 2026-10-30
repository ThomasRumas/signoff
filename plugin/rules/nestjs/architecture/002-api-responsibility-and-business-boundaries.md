# Decision: API Responsibility and Business Boundaries

## Status

Accepted

## Scope

The ownership model applies across languages and frameworks; it does not
require NestJS.

## Context

An API sits between clients, identity systems, data stores, and other services. When ownership is unclear, business behavior leaks into controllers, clients reproduce server rules, or integration code becomes the accidental owner of a business process.

The architecture needs a clear division of responsibility without duplicating the detailed rules for API contracts, authorization, persistence, errors, or observability.

## Decision

The API owns business-facing contracts, business use cases, orchestration, and the translation between application outcomes and transport responses.

Responsibilities are divided as follows:

| Boundary | Owns | Must not own |
| --- | --- | --- |
| Client | Presentation, client state, and user interaction | Server business rules or persistence orchestration |
| API transport | HTTP routing, input binding, response selection, and transport translation | Multi-step business workflows or infrastructure lifecycle |
| API application/feature service | Use cases, business orchestration, and feature policy | Client presentation or provider-specific transport details |
| Persistence boundary | Storage access and database representation | API response ownership or unrelated business workflows |
| External integration boundary | Communication with an external capability | The API's overall business process |
| Identity provider | Identity assertions and identity lifecycle | API-owned business authorization decisions |

The API MAY aggregate data from several owned integrations when the aggregation represents an API business or consumer contract. The orchestration belongs in the application or feature service, not in the controller or a generic proxy layer.

## Rules

- The API MUST own the business contract it exposes to consumers, including the meaning of resources, actions, and response views.
- HTTP transport handlers (controllers, route handlers, or their equivalent) MUST translate transport input into an application call and translate the application result into a transport response. They MUST NOT become the primary location for business rules.
- Feature services or use-case handlers MUST own business orchestration and policy for their feature.
- Persistence and external integration code MUST remain behind an explicit boundary owned by the capability it serves.
- A persistence model MUST NOT become the API contract by accident. Response views and transport representations belong to the API boundary.
- Domain or application errors MUST remain independent of HTTP concerns until the transport boundary translates them.
- The API MUST NOT delegate client presentation decisions, browser state, or user-interface behavior to a database or external integration.
- Identity validation and provider-specific token mechanics belong to the authentication boundary. Feature code MAY consume a normalized identity context but MUST NOT call the identity provider directly for ordinary request handling.
- Aggregation MAY be implemented in a feature service when it provides a coherent API contract. A generic proxy or controller MUST NOT accumulate unrelated business workflows.
- A feature MUST NOT duplicate business behavior that is already owned by another API capability. It SHOULD call a stable application boundary or extract a shared capability when reuse is real.

These rules define ownership only. Detailed rules for response DTOs, API errors, authorization, persistence access, and frontend-oriented aggregation remain in the [API engineering rules](../engineering-rules/README.md).

## Rationale

Clear ownership prevents transport code from becoming a second application layer and keeps infrastructure replaceable. It also gives consumers a stable contract: the API can change storage or external providers without requiring clients to understand those implementation details.

The boundary is intentionally pragmatic. A small feature does not need a complete domain model or repository hierarchy. It does need an identifiable owner for the use case, its integrations, and its transport translation.

## Alternatives Considered

### Business logic in controllers

Rejected because controllers are transport adapters. Workflows placed there become difficult to reuse outside HTTP and tend to mix validation, orchestration, persistence, and response formatting.

### Business logic in the database or external service

Rejected as a default because the API contract and cross-system orchestration would become dependent on infrastructure that does not own the consumer-facing behavior.

### A generic integration or proxy layer as the business owner

Rejected because a generic layer has no clear feature ownership and can grow into an unbounded second API.

## Consequences

### Positive consequences

- Business behavior has a stable application owner.
- Clients remain independent of persistence and provider implementation details.
- Controllers stay small and focused on transport concerns.
- External integrations can be replaced or tested behind their boundaries.

### Negative consequences

- Cross-system use cases require explicit orchestration in an application service.
- Some changes span a feature service, an integration boundary, and a transport contract.
- Teams must decide whether a shared behavior is truly reusable before extracting it.

## Exceptions and Review Triggers

A transport handler MAY contain simple, one-step mapping when no business decision is involved. A feature MAY use a direct persistence client when the service boundary remains clear and the feature is small.

Review the boundary when controllers contain repeated workflows, multiple features duplicate orchestration, a proxy layer begins making business decisions, or several consumers need a shared aggregation contract. A change that moves business ownership to another system MUST be documented as an explicit integration decision.

## Example

`CatalogController` receives a request for an item and calls `CatalogService`. `CatalogService` coordinates the catalog data source and returns a summary projection. If the item does not exist, the service raises `ItemNotFoundError`, which the controller translates into the API's documented not-found response.

The controller does not construct database queries, decide pricing policy, or call the identity provider. The data source does not decide how the API represents a missing item. A separate `CatalogSummaryService` may combine inventory and catalog data when that combined view is an intentional API contract.

## Related Guidance

- [API engineering rules](../engineering-rules/README.md)
