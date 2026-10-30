# Rule: Use REST Resources with Explicit Response Views

## Status

Accepted

## Scope

This rule applies to REST resources in NestJS APIs. It defines the URL and
query-parameter conventions for collection, detail, and supported response
representations.

## Context

A collection and an individual resource are related REST resources but do not
need the same payload. A product list usually needs a small set of fields for
scanning, while a product detail view may need description, features, and
related information.

The API must expose these variations without making the URL pretend that each
serialization is a different resource or allowing clients to request arbitrary
database fields.

## Decision

The same collection resource MUST use a documented `view` query parameter when
the consumer needs a supported representation variant. For the product
example, the API MUST use:

- `GET /products/:id` for one product's detail representation.
- `GET /products?view=summary` for the minimal product collection view.
- `GET /products?view=full` for the bounded, richer product collection view.
- `GET /products` with no `view` for the documented default, which MUST be
  `summary` unless the API documents another default.

## Rules

- `view` MUST be a validated enum of supported representations, not an
  arbitrary database projection language.
- A collection view MUST change only the documented representation of the same
  resource. It MUST NOT introduce unrelated business operations.
- Filtering, sorting, pagination, and `view` SHOULD compose as query
  parameters, for example `GET /products?view=summary&category=tools&page=2`.
- A separate path MUST be used for a distinct resource or business operation,
  not merely a second serialization of the same collection.
- Resource paths MUST use nouns and MUST NOT encode controller method names or
  database table names that are not meaningful to consumers.
- The response view MUST be selected by a business service method. The
  controller MAY select the method after validating the query DTO.
- Supported views MUST have separate response DTOs when their fields or
  semantics differ materially.
- The API MUST document the default view, every supported view, its response
  schema, pagination metadata, and status codes in OpenAPI.
- A view MUST NOT bypass authorization, validation, observability, or
  performance measurement.

## Rationale

Query parameters are appropriate for variations of one resource because the
resource identity remains `/products`; only its representation changes. A
controlled enum keeps the contract discoverable, cacheable, and documentable.
Separate routes remain available for genuinely different resources or actions.

## Alternatives Considered

### Use `/products/summary` and `/products/full`

These paths make two representations look like separate resources and can
duplicate route and documentation semantics. The query parameter makes the
relationship explicit.

### Accept arbitrary `fields`

An unrestricted field selector couples consumers to internal names and makes
security, caching, OpenAPI, and performance difficult to govern. A named view
keeps the public contract bounded.

### Use an action query such as `?action=export`

An action is not a representation of the collection. It needs its own business
operation and HTTP semantics, such as a documented export job.

## Consequences

Each supported view requires a response DTO, service method, OpenAPI schema,
and contract tests. Consumers get predictable payloads and the API can evolve
internal data without making arbitrary field selection part of the contract.

## Exceptions

A project MAY use a separate route when a representation is a distinct
business resource with its own lifecycle, authorization, caching, or ownership.
The decision MUST be documented and MUST NOT be made only to avoid defining a
response DTO.

## Examples

### Good: one resource with documented views

```text
GET /products?view=summary
-> ProductSummaryResponse[]

GET /products?view=full
-> ProductFullResponse[]

GET /products/product-123
-> ProductDetailResponse
```

### Good: view with normal collection queries

```text
GET /products?view=summary&category=tools&sort=price&page=2&pageSize=20
```

The query describes one product collection, its representation, and its
collection controls.

### Bad: a second route for the same representation

```text
GET /products/summary
```

This should be `GET /products?view=summary` unless `summary` is a distinct
business resource.

### Bad: arbitrary persistence projection

```text
GET /products?fields=warehouseStockId,internalMargin,deletedAt
```

Consumers must not select internal persistence fields. The API owns the
allow-list of public representations.

### Bad: action hidden in a collection query

```text
GET /products?action=deactivate
```

This is an operation, not a collection representation. It needs an explicit
business endpoint and the appropriate HTTP method and authorization.

## References

- [001-business-oriented-api-design.md](001-business-oriented-api-design.md)
- [003-response-dtos-and-reactive-projections.md](003-response-dtos-and-reactive-projections.md)
- [005-openapi-contracts-for-business-responses.md](005-openapi-contracts-for-business-responses.md)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)