# Rule: Log Technical Service Failures with NestJS Logger

## Status

Accepted

## Scope

This rule applies to NestJS services that execute business or technical logic,
including services that return RxJS Observables. It defines technical error
logging, propagation, and separation from consumer-facing HTTP errors.

## Context

A consumer-facing error does not provide enough information to diagnose where
or why an operation failed. Services have the context of the operation and its
dependencies, so they are the appropriate place to record technical details
before propagating a failure.

Services should provide context such as the operation, relevant resource
identifier, expected versus unexpected nature of the failure, and the original
stack trace when available. Logs must remain safe for their destination.

## Decision

Services MUST use the official NestJS `Logger` for technical observability. When
a service operation fails, the service MUST log the failure with useful
technical context and MUST propagate the error unless it has an explicitly
defined recovery behavior. Services MUST NOT format the final HTTP response.

## Rules

- Each service SHOULD create a logger with a stable service context, such as
  `new Logger(UsersService.name)`.
- Error logs MUST identify the failed operation and SHOULD include relevant
  non-sensitive identifiers and execution context.
- When the failure is an `Error`, logging SHOULD preserve its stack trace.
- Services MUST NOT silently swallow errors unless a documented fallback is the
  intended business behavior.
- Services MUST NOT convert failures into NestJS HTTP exceptions merely to
  communicate with a controller.
- Services MUST NOT log passwords, access tokens, authorization headers, or
  unnecessary personal or confidential data.
- A service SHOULD log a failure at the boundary where it has the clearest
  technical context. Callers SHOULD avoid logging the same unchanged error
  repeatedly.
- After logging, the error MUST remain available to the controller or generic
  exception boundary for public translation and safe response handling.

## Rationale

NestJS `Logger` provides a consistent application logging interface while
keeping services independent from transport-specific response formatting.
Logging before propagation preserves technical context without sacrificing the
controller's responsibility for the consumer contract. Structured access and
error fields are defined in
[004-structured-access-logging.md](004-structured-access-logging.md).

## Alternatives Considered

### Log only in the controller

The controller may know the route but often lacks the dependency and operation
context needed to diagnose a failure. Service-level context is lost when every
failure is handled only at the HTTP boundary.

### Swallow the error after logging

Logging does not define recovery. Swallowing a failure can turn an unsuccessful
operation into a false success or leave the Observable in an invalid state.

### Throw HTTP exceptions from services

This couples business logic to NestJS HTTP transport and makes service behavior
less reusable. Controllers should own public HTTP translation.

### Log with `console.error`

Direct console calls bypass the application's standard logger context and
configuration. NestJS services should use the built-in `Logger`.

## Consequences

Operational logs contain the context needed to investigate failures, and
controllers retain ownership of public responses. Teams must choose useful
identifiers carefully and manage log access because technical context can be
sensitive.

## Exceptions

A service MAY recover from a failure when fallback behavior is an explicit part
of the business contract. The service SHOULD log the failure at an appropriate
level and MUST make the fallback observable to callers where that matters.

A lower layer MAY already provide the authoritative log for a failure. The
service may avoid duplicate logging when it does not add meaningful context.

## Examples

### Good: log context, preserve the stack, and propagate

```ts
private readonly logger = new Logger(UsersService.name);

getUser(id: string): Observable<User> {
  return this.repository.findUser(id).pipe(
    catchError((error: unknown) => {
      this.logger.error(
        `Failed to retrieve user ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      return throwError(() => error);
    }),
  );
}
```

The service records the operation and technical cause while allowing the
controller or generic exception boundary to handle the public response.

### Good: keep the log free of credentials

```ts
this.logger.error(
  `Authentication failed for user ${userId}`,
  error instanceof Error ? error.stack : String(error),
);
```

The message identifies the operation without writing a password or token.

### Bad: swallow an operation failure

```ts
return this.repository.findUser(id).pipe(
  catchError((error) => {
    this.logger.error("Lookup failed", error);
    return of(undefined);
  }),
);
```

This converts an error into an ambiguous success unless returning `undefined` is
the documented behavior of the operation.

### Bad: couple a service to HTTP formatting

```ts
catchError(() =>
  throwError(
    () =>
      new ConflictException({
        statusCode: 409,
        errorCode: "USER_EMAIL_ALREADY_EXISTS",
        message: "A user with this email address already exists.",
      }),
  ),
);
```

The service should expose a domain or technical failure; the controller owns
translation into the consumer-facing HTTP contract.

### Bad: log a secret

```ts
this.logger.error(`Request failed with token ${accessToken}`);
```

Logs and their downstream storage must be treated as sensitive operational
artifacts.

## References

- [NestJS Logger](https://docs.nestjs.com/techniques/logger)
- [RxJS `catchError`](https://rxjs.dev/api/operators/catchError)
- [001-api-error-contract.md](001-api-error-contract.md)
- [002-controller-error-translation.md](002-controller-error-translation.md)
- [004-structured-access-logging.md](004-structured-access-logging.md)
