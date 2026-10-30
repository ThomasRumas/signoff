# Rule: Translate Known Errors at the RxJS Controller Boundary

## Status

Accepted

## Scope

This rule applies to NestJS controllers whose asynchronous operations return
RxJS Observables. It defines how internal service failures become the public
HTTP error contract.

## Context

Controllers are the boundary between application logic and API consumers. A
service should not need to construct HTTP responses, while a controller must
not expose raw internal errors. RxJS propagates failures through the
Observable, so the translation point must be explicit.

## Decision

Controllers MUST translate known domain or application failures into the
structured API error contract. Controllers MUST preserve the distinction
between known failures and unexpected failures: an unknown error MUST NOT be
reported as a guessed business error such as `409 Conflict`.

## Rules

- Controllers SHOULD return the service Observable directly when no error
  translation is required.
- Controller `catchError` logic MUST map only errors whose meaning and public
  response are known.
- A known error mapping MUST set the appropriate HTTP status, stable
  `errorCode`, and safe human-readable `message`.
- Unknown errors MUST remain failures and MUST be handled by the application's
  generic exception boundary or filter as a safe server error. Their internal
  details MUST NOT be returned to consumers.
- Controllers MUST NOT create business rules or duplicate service logic merely
  to format an error.
- Controllers MUST NOT manually subscribe to an Observable just to translate an
  error.
- The service layer MUST remain independent of the HTTP exception types used by
  the controller. See
  [003-service-error-observability.md](003-service-error-observability.md).
- Controller error mappings SHOULD be covered by HTTP-level tests, including
  the status and structured response body. See
  [004-controller-and-http-testing.md](../testing-strategy/004-controller-and-http-testing.md).

## Rationale

The controller has the necessary HTTP context but does not own the business
operation. Explicit mapping preserves separation of concerns and prevents
internal implementation errors from becoming accidental public contracts.
Distinguishing known and unknown errors also prevents misleading status codes
and messages.

## Alternatives Considered

### Translate every error to one business exception

This hides unexpected failures behind an incorrect status and error code. A
database outage is not the same contract as a duplicate-user conflict.

### Return the raw service error

Raw errors can expose stack traces, dependency details, or sensitive values.
They also give consumers an unstable contract.

### Make services throw HTTP exceptions

This couples reusable business logic to NestJS transport concerns and makes the
same service harder to use from another transport or application boundary.

## Consequences

Known consumer behavior becomes explicit and testable. Teams must maintain the
mapping between domain failures and public error codes and must configure a
generic safe handler for unexpected failures.

## Exceptions

A controller MAY use a framework exception directly when it already represents
the documented public contract, such as a standard not-found or validation
response. The response MUST still avoid internal details and remain consistent
with the API error contract.

## Examples

### Good: map a known domain error and preserve unknown failures

```ts
return this.userService.createUser(dto).pipe(
  catchError((error) => {
    if (error instanceof UserEmailAlreadyExistsError) {
      return throwError(
        () =>
          new ConflictException({
            statusCode: 409,
            errorCode: "USER_EMAIL_ALREADY_EXISTS",
            message: "A user with this email address already exists.",
          }),
      );
    }

    return throwError(() => error);
  }),
);
```

The controller translates only a known failure. The generic exception boundary
can safely handle an unknown failure and the service can provide its technical
context.

### Good: return the service Observable when no mapping is needed

```ts
@Get(":id")
getUser(@Param("id") id: string): Observable<User> {
  return this.userService.getUser(id);
}
```

The controller remains a thin transport boundary.

### Bad: translate every error to a conflict

```ts
return this.userService.createUser(dto).pipe(
  catchError(() =>
    throwError(
      () =>
        new ConflictException({
          statusCode: 409,
          errorCode: "USER_EMAIL_ALREADY_EXISTS",
          message: "A user with this email address already exists.",
        }),
    ),
  ),
);
```

A timeout, database outage, or programming error would be misreported as a
duplicate email.

### Bad: expose the raw error to the consumer

```ts
return this.userService.createUser(dto).pipe(
  catchError((error) => throwError(() => new HttpException(error, 500))),
);
```

This can leak internal error structure and creates no stable public contract.

## References

- [NestJS exception filters](https://docs.nestjs.com/exception-filters)
- [RxJS `catchError`](https://rxjs.dev/api/operators/catchError)
- [Reactive service and controller design](../reactive-programmation/004-service-and-controller-design.md)
- [001-api-error-contract.md](001-api-error-contract.md)
- [003-service-error-observability.md](003-service-error-observability.md)
