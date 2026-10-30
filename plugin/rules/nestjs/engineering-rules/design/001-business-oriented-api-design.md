# Rule: Design APIs Around Business Use Cases

## Status

Accepted

## Scope

This rule applies to APIs that serve frontend applications or other consumers,
regardless of language or framework. It defines the boundary between
persistence data, business operations, and public HTTP contracts.

## Context

An API that mirrors database tables and CRUD operations forces every frontend to
understand persistence structure, join related data, calculate display values,
and remove fields it should never receive. That is a technical interface, not a
business API.

The API is responsible for making a business capability useful to its
consumers. A request may need data from several repositories or external
systems, derived values, authorization-aware filtering, and a response shape
that is specific to a frontend workflow.

## Decision

APIs MUST be designed around business capabilities and consumer use cases. An
HTTP transport handler MUST expose a documented public contract rather than
returning a database record by default.

The application or use-case boundary MUST own the composition, cleanup,
derivation, and selection needed to produce that contract. Persistence
adapters MUST remain persistence-facing and MUST NOT define the public
response shape alone.

## Rules

- An endpoint MUST have a named business purpose and a documented consumer
  response.
- Transport handlers MUST translate HTTP input, select the appropriate
  business operation, and return its result. They MUST NOT contain business
  rules, persistence queries, or ad hoc data cleanup.
- The application or use-case boundary MUST hide persistence and
  external-system details behind an explicit business result or response
  projection.
- API responses MUST use project-owned response representations. Raw ORM or
  database entities MUST NOT be returned directly.
- The application layer SHOULD aggregate related data when doing so removes unnecessary
  frontend orchestration and belongs to the API's business responsibility.
- A response MUST contain only fields that are safe, useful, and stable for the
  consumer. Internal IDs, audit fields, secrets, persistence metadata, and
  implementation details MUST be excluded unless explicitly part of the public
  contract.
- A simple CRUD operation MAY be exposed when it is itself a useful business
  capability. CRUD MUST NOT be used as a reason to expose the database schema.
- The public contract MUST remain stable when persistence models change.

## Rationale

Business-oriented APIs reduce frontend coupling, centralize business decisions,
and prevent every consumer from reimplementing the same composition and data
cleanup. They also create a deliberate security boundary between internal data
and public representations.

## Alternatives Considered

### Expose CRUD endpoints for every table

This is quick to generate but leaks persistence structure, duplicates business
logic in consumers, and makes schema changes consumer-facing. It is not the
default for a business API.

### Let the frontend join all resources

This increases network round trips, duplicates authorization and composition
logic, and makes each frontend responsible for backend implementation details.
The API should provide a business operation when the composition is shared or
business-critical.

### Put all mapping in the transport handler

Transport handlers are the HTTP boundary, not the owner of business
transformation. Keeping mapping and composition in the application layer makes
it reusable, testable, and consistent across transports.

## Consequences

Services and DTOs require deliberate design, and a single database entity may
need several public representations. In return, frontends receive data that
matches their workflows and remain independent of persistence changes.

## Exceptions

A controlled internal or administrative endpoint MAY expose a persistence-like
shape when its consumers, access controls, and lifecycle are explicitly
documented. It MUST still use a public DTO and MUST NOT expose secrets or
unintended internal fields.

## Examples

### Good: frontend-ready business response

```text
GET /products?view=summary

[
  {
    "id": "product-123",
    "name": "Cordless drill",
    "price": 129.99,
    "availability": "in_stock"
  }
]
```

The response contains the fields needed to render a product list, including a
business-level availability value. It does not expose the database row or
internal inventory fields.

### Good: business detail response

```text
GET /products/product-123

{
  "id": "product-123",
  "name": "Cordless drill",
  "description": "18V cordless drill",
  "price": 129.99,
  "availability": "in_stock",
  "features": ["18V battery", "2-year warranty"]
}
```

The API composes the product and its public features for the detail use case.

### Bad: database-shaped response

```text
GET /products

{
  "id": "product-123",
  "warehouseStockId": 42,
  "deletedAt": null,
  "createdAt": "2026-09-02T10:00:00Z",
  "internalMargin": 0.24
}
```

This exposes persistence and internal business data without defining a public
contract.

### Bad: frontend-owned business composition

If every client separately loads a product and its stock, then derives
availability, the API has delegated shared business logic to its consumers.
That composition belongs in the API when it represents an API business
capability.

## Related Guidance

- [002-rest-resource-and-response-views.md](002-rest-resource-and-response-views.md)
- [API error contract](../observability/001-api-error-contract.md)

The following documents describe NestJS implementation patterns; they are not
requirements of this generic rule:

- [NestJS response DTO projections](003-response-dtos-and-reactive-projections.md)
- [NestJS DTO validation and transformation](004-nestjs-dto-validation-and-transformation.md)
- [NestJS reactive service and controller design](../reactive-programmation/004-service-and-controller-design.md)