# Rule: Expose a Stable Structured API Error Contract

## Status

Accepted

## Scope

This rule applies to consumer-facing errors returned by APIs, regardless of
language or framework. It defines the fields and stability expectations for
errors returned over HTTP.

## Context

An HTTP status identifies a broad category of failure, but it does not always
identify the business or application condition precisely. Consumers need a
machine-readable value for application logic and a safe message for people.

Human-readable messages can change because of wording improvements,
localization, or presentation requirements. Consumers must therefore not parse
message text to determine behavior.

## Decision

Consumer-facing API errors MUST provide an HTTP status, a stable API-specific
`errorCode`, and a human-readable `message`. The `errorCode` is part of the API
contract and MUST remain stable when the wording of `message` changes.

## Rules

- Every documented consumer-facing failure MUST define an appropriate HTTP
  status code.
- Every documented business or application failure MUST include a stable,
  machine-readable `errorCode`.
- `errorCode` values SHOULD use a consistent, domain-oriented naming convention
  such as `USER_EMAIL_ALREADY_EXISTS`.
- `message` MUST be understandable to the intended consumer and MUST NOT expose
  stack traces, credentials, SQL, internal hostnames, or other sensitive
  implementation details.
- Consumers MUST use `errorCode` for branching and MUST NOT compare exact
  human-readable messages.
- Error-code changes MUST be treated as API-contract changes and reviewed for
  consumer compatibility.
- Unexpected failures MUST use the API's generic safe error representation;
  internal diagnostic details belong in protected logs. The logging mechanism
  belongs to the implementation profile.

## Rationale

The three fields serve different audiences. HTTP status supports standard
protocol handling, `errorCode` supports stable machine behavior, and `message`
provides human context. Separating those responsibilities lets the API improve
wording without breaking consumers and keeps internal diagnostics private.

## Alternatives Considered

### Return only an HTTP status and status text

This does not identify the specific business condition and forces consumers to
infer behavior from generic or unstable text.

### Use the message as the machine-readable identifier

Messages are presentation text and may change or be localized. They are not a
stable integration contract.

### Expose the original internal error

Internal errors can contain implementation details or secrets and are not
reliable consumer-facing contracts. They should be logged privately and mapped
to a safe public error.

## Consequences

Consumers gain a predictable contract and can evolve independently of message
wording. Teams must maintain error-code ownership, document codes, and review
changes as part of API compatibility.

## Exceptions

A successful response MAY use a different problem shape when an external
standard or an existing public contract requires it. The project MUST document
how the standard still provides an equivalent stable machine-readable error
identifier and safe human-facing detail.

## Examples

### Good: structured consumer-facing error

```json
{
  "statusCode": 409,
  "errorCode": "USER_EMAIL_ALREADY_EXISTS",
  "message": "A user with this email address already exists."
}
```

A client can branch on `errorCode` while presenting `message` to a user.

### Bad: branch on message text

```ts
if (error.message === "A user with this email address already exists.") {
  retryWithAnotherEmail();
}
```

A wording or localization change silently breaks this client.

### Bad: expose internal diagnostics

```json
{
  "statusCode": 500,
  "errorCode": "DATABASE_FAILURE",
  "message": "PrismaClientKnownRequestError at db.internal:5432 ..."
}
```

The consumer needs a safe message; the technical error belongs in protected
logs.

## NestJS Implementation References

- [NestJS exception filters](https://docs.nestjs.com/exception-filters)
- [002-controller-error-translation.md](002-controller-error-translation.md)
- [003-service-error-observability.md](003-service-error-observability.md)
