# Rule: Preserve Reactive Boundaries in Services and Controllers

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications using the reactive
business-flow model defined in [001-reactive-programming-default.md](001-reactive-programming-default.md).

## Context

Business services understand how to compose and transform asynchronous sources.
Controllers translate HTTP requests into service calls. If controllers
manually subscribe or services expose several uncoordinated async values,
composition, errors, and lifecycle ownership become harder to reason about.

The HTTP response may need a public DTO that differs from the service's raw
repository data. Selecting a use-case-specific service method and returning its
typed Observable is still thin-controller delegation; cleaning and deriving
the business response in the controller is not.

## Decision

Business services SHOULD expose `Observable<T>` for asynchronous operations they
compose. Controllers SHOULD return that Observable directly when NestJS can
handle the response, allowing NestJS to manage the request subscription.

## Rules

- An asynchronous business service SHOULD return `Observable<T>` when it owns
  reactive composition or transformation.
- Services MUST compose the dependencies required for one business operation
  rather than returning several Promises or Observables for callers to join.
- Controllers SHOULD delegate to the business service and return its Observable
  when the HTTP response contract allows it.
- Controllers MAY select a service method for a validated response view, such
  as a summary or detail projection, but the service MUST own the projection
  and business transformation. See
  [the API design rules](../design/003-response-dtos-and-reactive-projections.md).
- Controllers MUST NOT manually subscribe merely to convert an Observable into
  a response Promise or wrapper.
- A manual subscription MAY be used for a deliberate background or integration
  workflow, but that workflow MUST define ownership, cancellation, error
  handling, and cleanup explicitly.
- This rule does not define general stream lifecycle management for long-lived
  background subscriptions.

## Rationale

The service boundary is the natural place to coordinate data sources and apply
business transformations. Returning the resulting Observable keeps the
controller thin and lets NestJS own the request lifecycle for HTTP responses.

## Alternatives Considered

### Subscribe in the controller

Wrapping a service Observable in a manually constructed Promise duplicates
NestJS response handling and can obscure errors or cleanup. Direct delegation is
clearer for normal request/response operations.

### Return multiple async values from the service

This leaks coordination to every caller and makes the business operation's
contract ambiguous. The service should return the composed business result.

### Require Observables for synchronous operations

This rule applies to asynchronous business operations. Synchronous methods do
not need an Observable solely to satisfy the convention.

## Consequences

Controllers remain small and service contracts make asynchronous composition
visible. Background workflows need separate lifecycle decisions, and services
must expose types that accurately describe their Observable results.

## Exceptions

A controller MAY adapt or subscribe to an Observable when a specific framework
adapter, streaming response, or integration requires manual lifecycle control.
The exception must document who owns subscription, errors, cancellation, and
cleanup.

## Examples

### Good: service composes, controller delegates

```ts
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  getUserDetails(userId: string): Observable<UserDetails> {
    return forkJoin({
      user: from(this.prisma.user.findUnique({ where: { id: userId } })),
      externalUser: this.httpService
        .get<ExternalUser>(`https://api.example.com/users/${userId}`)
        .pipe(map((response) => response.data)),
    });
  }
}

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  getUserDetails(
    @Param("id") id: string,
  ): Observable<UserDetails> {
    return this.userService.getUserDetails(id);
  }
}
```

NestJS receives the returned Observable and handles it as part of the HTTP
request lifecycle.

### Bad: controller manually wraps a subscription

```ts
@Get(":id")
getUserDetails(@Param("id") id: string): Promise<UserDetails> {
  return new Promise((resolve, reject) => {
    this.userService.getUserDetails(id).subscribe({
      next: resolve,
      error: reject,
    });
  });
}
```

The controller now owns subscription behavior unnecessarily and changes the
service contract at the HTTP boundary.

### Bad: service leaks uncoordinated sources

```ts
getUserDetails(userId: string) {
  return {
    user: this.prisma.user.findUnique({ where: { id: userId } }),
    externalUser: this.getExternalUser(userId),
  };
}
```

Callers must understand and coordinate a Promise and an Observable. The service
should compose them into one `Observable<UserDetails>`.

## References

- [001-reactive-programming-default.md](001-reactive-programming-default.md)
- [002-reactive-http-calls.md](002-reactive-http-calls.md)
- [003-promise-to-observable-conversion.md](003-promise-to-observable-conversion.md)
