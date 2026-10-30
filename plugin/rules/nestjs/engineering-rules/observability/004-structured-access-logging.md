# Rule: Structure API Access and Error Logs

## Status

Accepted

## Scope

This rule applies to API access and error logs regardless of logging provider,
framework, or runtime. It defines the minimum structured fields needed to
identify an HTTP request and its failure without prescribing a logger,
formatter, storage system, or dashboard.

## Context

Unstructured log messages make it difficult to identify which endpoint failed
and to compare activity across APIs. A small, consistent set of fields makes
access and error records searchable while avoiding dependency on a particular
observability platform.

## Decision

APIs MUST emit structured access records with a UTC timestamp, HTTP method, and
route template. An error record MUST include those fields plus a stable error
code and safe error message. This contract describes the record fields only;
each application chooses how to produce and transport them.

## Rules

- Access records MUST be emitted as structured fields and MUST include:
  - `timestamp`: event time in UTC using ISO 8601.
  - `method`: the uppercase HTTP method.
  - `route`: the route template, without concrete path parameter values.
- Error records MUST include the access fields above and:
  - `errorCode`: a stable, machine-readable identifier for the failure.
  - `errorMessage`: a concise, safe description of the failure.
- `errorCode` MUST remain stable for the same documented failure condition.
  Consumers MUST NOT rely on log messages as an API contract.
- `errorMessage` MUST NOT contain credentials, access tokens, authorization
  headers, request bodies, or unnecessary personal or confidential data.
- Structured fields MUST be available to log processing directly; consumers
  MUST NOT need to parse an assembled free-form message to recover them.
- Technical details such as stack traces belong in access-controlled service
  logs, not in `errorMessage` or the public HTTP response.
- Error/access records SHOULD use the same field names and route template across
  the API so that request failures can be compared consistently.
- This rule does not require a logging library, output format, sink, vendor, or
  dashboard. Project integrations MAY add fields without changing the minimum
  contract above.
- The public HTTP error response MUST separately follow
  [001-api-error-contract.md](001-api-error-contract.md).

## Rationale

A shared structured contract makes access and error records consistent across
services and tools. Keeping technical details in protected logs while exposing
a safe error contract to consumers supports diagnosis without weakening API
security.

## Alternatives Considered

### Format records as arbitrary text

Arbitrary strings make fields difficult to search consistently and require
downstream tools to parse message text to recover the request context.

### Use a vendor-specific access-log package as the API contract

Libraries and log sinks are implementation choices. The API logging contract
should define the fields, not mandate one provider or package.

### Put technical details in the HTTP response

Responses are public API contracts and may expose sensitive implementation
details. Protected technical logs are the appropriate destination for such
context.

## Consequences

APIs gain consistent records that can be consumed by the project's logging
infrastructure. Teams choose the transport and destination while preserving
the required fields and safe-data constraints.

## Exceptions

Projects MAY add fields required by their infrastructure or operational
practice. Additional fields MUST NOT replace the required fields or expose
sensitive data.

## Examples

### Good: access record

```json
{
  "timestamp": "2026-10-21T14:32:10Z",
  "method": "POST",
  "route": "/users"
}
```

### Good: error record

```json
{
  "timestamp": "2026-10-21T14:32:10Z",
  "method": "GET",
  "route": "/users/{id}",
  "errorCode": "USER_NOT_FOUND",
  "errorMessage": "The requested user was not found."
}
```

The route uses a template instead of a concrete identifier. Technical
diagnostics can be recorded separately in protected service logs.

### Bad: encode fields only in a free-form message

```ts
logger.error(`GET /users/${userId} failed: ${error.message}`)
```

Downstream systems would need to parse the message to find the method, route,
and error condition.

### Bad: log a credential

Never emit credentials, authorization headers, full request bodies, or
unnecessary personal data to logs.

## References

- [001-api-error-contract.md](001-api-error-contract.md)
- [003-service-error-observability.md](003-service-error-observability.md)
