# Rule: Follow REST API Design Reference Conventions

## Status

Accepted

## Scope

This rule applies to REST APIs. It captures a compact reference of URL, HTTP,
query, security, and status-code conventions and complements the
business-oriented resource, response, validation, OpenAPI, and pagination
rules in this directory.

## Context

Consistent URLs, HTTP semantics, query parameters, security controls, status
codes, and operational endpoints make APIs easier to discover and consume.
This reference provides a compact baseline; this rule turns each convention
into a reviewable project standard.

## Decision

APIs MUST use noun-based REST resources, lower camel case for attributes
and parameters, a major version in the URL, documented HTTP semantics, and
secure, discoverable contracts. Collection endpoints MUST follow the query,
pagination, partial-response, filtering, and sorting conventions below when
those capabilities apply to the resource.

## Rules

### URLs and resources

- Query parameters and JSON attributes MUST use lower camel case, for example
  `idProduct` and `idModel`. Acronyms MUST follow the project's documented
  casing convention rather than introducing inconsistent spellings.
- The major API version MUST be present in the URL, for example
  `GET /v1/products`. A breaking contract change MUST use a new major version.
- Resource paths MUST use English nouns, MUST use plural collection names, and
  MUST NOT use verbs such as `getAllProducts`.
- An individual resource MUST use the collection path followed by its
  identifier, for example `GET /products/1234`, not a singular collection path
  such as `/product/1234`.
- A resource related to another resource SHOULD use a nested sub-resource,
  for example `GET /products/1234/features/1234`, when the relationship is
  part of the public resource model and the nesting remains bounded.
- An operation that is not naturally a resource MAY use the pattern
  `/{resource}/{action}`, for example `POST /users/12:subscribe`. The action
  MUST be a documented business operation and MUST use the HTTP method and
  authorization appropriate to that operation.
- APIs MUST use HTTPS for every request.

### Documentation and discoverability

- Every public API MUST publish an OpenAPI contract. The
  [OpenAPI rules](005-openapi-contracts-for-business-responses.md) in this
  directory define the authoritative documentation requirements.
- Production and non-production base URLs MUST be stable and documented for
  each environment. Consumers MUST NOT need to guess an environment's URL.
- The API SHOULD provide a `/health` endpoint for checking API availability.
  The endpoint MUST avoid exposing secrets, dependency credentials, or
  sensitive operational details.
- APIs SHOULD provide hypermedia links when clients benefit from discovering
  related actions or resources. Links MUST be treated as part of the public
  contract when provided and MUST respect authorization.
- API documentation MUST describe URL versioning, resource paths, query
  parameters, pagination, response fields, HTTP methods, status codes, and
  security requirements.

### Security

- OAuth 2.0 MUST be used to manage authorization where the API requires
  delegated or token-based access.
- OpenID Connect MUST be used to manage authentication where the API requires
  identity and user authentication.
- Authentication and authorization MUST remain distinct concerns: a valid
  identity does not imply permission to access a resource.
- Resource, sub-resource, action, and aggregate routes MUST enforce the same
  authorization policy regardless of which URL shape the consumer uses.

### HTTP methods and success statuses

- `GET` MUST read a collection or an individual resource and MUST NOT have
  observable side effects.
- `POST` MUST create a new instance in a collection or start a documented
  operation. A successful resource creation SHOULD return `201 Created` and
  identify the created resource with the response or `Location` header.
- `PUT` MUST replace or update the addressed resource according to its
  documented idempotent contract. A successful update MAY return `200 OK` with
  a representation or `204 No Content` without a response body.
- `DELETE` MUST delete an addressed resource. A successful deletion SHOULD
  return `204 No Content` when there is no response representation.
- `200 OK` MUST be used for a successful request that returns a normal
  representation, including a page of a paginated collection.
- `201 Created` MUST indicate that a resource was created.
- `202 Accepted` MUST indicate that processing was accepted for asynchronous
  completion. The response SHOULD provide a way to inspect the operation when
  the client needs completion status.
- `204 No Content` MUST indicate successful completion with no representation
  to return.

### Query strings

- Full-text search MUST use the `q` query parameter, for example
  `GET /products?q=electric+drill`.
- Filters MUST use named attribute-value parameters, for example
  `GET /products?category=standard&idModel=1234`.
- Partial responses MAY use a `fields` parameter to request an allow-listed
  subset of public fields, for example
  `GET /products/123?fields=brand,idModel`. `fields` MUST NOT expose arbitrary
  persistence columns or bypass a named response view.
- Sorting MUST use `sort=attribute1`. Descending order MUST use
  `desc=attribute1`, and ascending order MUST use `asc=attribute1` when the
  client needs to state the direction explicitly. Resources MUST document
  their default sort order; the default direction is ascending.
- Search, filters, fields, sorting, and pagination MUST be validated and
  documented. Unsupported attributes, operators, or values MUST produce a
  documented client error rather than being passed through to a database.

### Pagination and date-time values

- Collection endpoints MUST support pagination when the collection can grow
  beyond a bounded response size, following the
  [standard pagination contract](../pagination/001-standard-pagination.md).
- Date and date-time values MUST use ISO 8601. APIs MUST document whether a
  field is a date, an offset date-time, or a UTC instant. Examples include
  `2018-04-09`, `2018-04-09T09:42:51Z`, and
  `2018-04-09T09:42:51+00:00`.

### Client error statuses

- `400 Bad Request` MUST indicate a malformed or invalid request that cannot
  be processed.
- `401 Unauthorized` MUST indicate that authentication is missing or invalid.
  The response MUST NOT be used to mean that an authenticated caller lacks
  permission.
- `403 Forbidden` MUST indicate that the caller is authenticated but lacks
  permission to access the resource.
- `404 Not Found` MUST indicate that the requested resource does not exist or
  is not exposed to the caller under the API's documented resource semantics.
- `405 Method Not Allowed` MUST indicate that the HTTP method is not supported
  for the addressed resource. The response SHOULD include an `Allow` header.
- `406 Not Acceptable` MUST indicate that the server cannot produce a
  representation matching the request's `Accept` constraints.

### Server, redirect, and cache statuses

- `500 Internal Server Error` MUST indicate an unexpected server condition.
  Error responses MUST use the API's safe error contract and MUST NOT expose
  stack traces, secrets, or internal service details.
- `301 Moved Permanently` MUST indicate that a resource has a new permanent
  URI. Clients SHOULD use the replacement URI for future requests.
- `302 Found` MAY indicate a temporary URI change. Clients MUST follow the
  API's documented redirect behavior because the target may change.
- `304 Not Modified` SHOULD be used for a conditional request when the client
  already has a valid representation and the resource has not changed. The
  response MUST remain consistent with the API's cache validators.
- Status codes MUST match the implemented behavior and MUST be documented in
  OpenAPI, including relevant error response schemas.

## Rationale

These conventions give API consumers predictable resource discovery,
request construction, authentication behavior, response handling, and error
processing. Explicit allow-lists and bounded pagination preserve the benefits
of rich query features without coupling consumers to persistence models.

## Alternatives Considered

### Verb-based URLs

Paths such as `/getAllProducts` describe controller operations instead of
resources, duplicate HTTP semantics, and make the API harder to evolve.

### Singular collection paths

Paths such as `/product/1234` make collection and instance relationships less
consistent. Plural collection nouns give the API one predictable URL shape.

### Arbitrary field and filter expressions

An unrestricted query language leaks internal names and complicates validation,
authorization, caching, OpenAPI, and performance. Public allow-lists and named
views keep the contract bounded.

### Treat every failure as `400`

Collapsing authentication, authorization, missing resources, unsupported
methods, and invalid representations into one status prevents clients from
handling failures correctly.

## Consequences

API teams must maintain versioned contracts, bounded query capabilities,
security configuration, operational endpoints, and status-code tests. Clients
gain consistent conventions and can distinguish request, identity, permission,
resource, representation, and server failures.

## Exceptions

A project MAY deviate from one of these conventions when a platform,
protocol, resource lifecycle, or security requirement makes it inappropriate.
The exception MUST be documented in the API contract and architecture
decision, including its impact on compatibility and consumers.

## Examples

### Good: versioned resource and documented queries

```text
GET /v1/products?q=electric+drill&category=standard&idModel=1234&sort=price&page=1&pageSize=30
GET /v1/products/1234?fields=brand,idModel
POST /v1/users/12:subscribe
```

### Good: explicit response and error contract

```text
200 OK             ProductPageResponse
201 Created        ProductResponse + Location header
202 Accepted       OperationStatusResponse
204 No Content     no response body
400 Bad Request    ValidationErrorResponse
401 Unauthorized   AuthenticationErrorResponse
403 Forbidden      AuthorizationErrorResponse
404 Not Found      NotFoundErrorResponse
500 Server Error   SafeErrorResponse
```

### Bad: unversioned, verb-based, singular URL

```text
GET /getAllProduct/1234
```

Use a versioned plural resource path such as `GET /v1/products/1234`.

## References

- [001-business-oriented-api-design.md](001-business-oriented-api-design.md)
- [002-rest-resource-and-response-views.md](002-rest-resource-and-response-views.md)
- [005-openapi-contracts-for-business-responses.md](005-openapi-contracts-for-business-responses.md)
- [Standard pagination](../pagination/001-standard-pagination.md)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [ISO 8601 overview](https://www.iso.org/iso-8601-date-and-time-format.html)
