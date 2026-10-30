# Rule: Use Observables for Asynchronous Business Flows

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications that use RxJS. It
defines the default abstraction for asynchronous business operations and how
reactive composition fits across services and controllers.

HTTP usage, Promise integration, service/controller boundaries, and resilience
policies are detailed in the related rules in this folder.

## Context

A business operation may combine data from an external HTTP API, Prisma, a
cache, another service, or a message source. If each dependency is handled with
a different asynchronous abstraction, callers must coordinate unrelated
Promises and Observables themselves.

RxJS Observables provide one composable model for representing, transforming,
combining, sequencing, and cancelling asynchronous work where appropriate.

## Decision

Observables MUST be the standard abstraction for asynchronous business
operations in NestJS. Reactive composition and resilience policy are separate
concerns: an Observable MUST NOT automatically receive retry, timeout, or
fallback behavior.

## Rules

- Business operations that perform asynchronous processing SHOULD expose an
  `Observable<T>` result.
- Async sources SHOULD be composed with RxJS operators rather than repeatedly
  converting between Promises and Observables.
- HTTP calls SHOULD preserve the Observable returned by NestJS `HttpService`.
- Promise-based dependencies MUST be converted with `from()` when they need to
  participate in a reactive flow; see [003-promise-to-observable-conversion.md](003-promise-to-observable-conversion.md).
- Business services SHOULD own the composition of their dependencies instead
  of forcing callers to coordinate several asynchronous operations.
- Controllers SHOULD return the service Observable when appropriate and MUST
  NOT subscribe manually just to adapt it to a response; see
  [004-service-and-controller-design.md](004-service-and-controller-design.md).
- Retry, timeout, fallback, and other resilience operators MUST be selected
  explicitly according to the dependency and operation; see
  [005-composition-vs-resilience.md](005-composition-vs-resilience.md).

## Rationale

A consistent abstraction makes heterogeneous asynchronous workflows easier to
compose and keeps business coordination inside the business service. Keeping
resilience separate prevents a representation choice from silently changing
failure, retry, or side-effect semantics.

## Alternatives Considered

### Use Promises for every asynchronous operation

Promises are appropriate for isolated operations, but using them everywhere
makes a service that combines Observable and Promise dependencies responsible
for repeated conversions and manual coordination. Observables are the default
for asynchronous business flows in this NestJS architecture.

### Subscribe inside every service or controller

Manual subscriptions hide ownership of the stream and can make error,
completion, and cleanup behavior inconsistent. Services compose streams and
NestJS handles controller response Observables.

### Add resilience operators to every Observable

Retry and timeout behavior depends on idempotency, side effects, and failure
modes. It cannot safely be inferred from the fact that a value is an
Observable.

## Consequences

Business services expose a consistent asynchronous contract and can combine
multiple sources without leaking coordination details to callers. Developers
must understand RxJS composition and must make resilience behavior explicit.
Some simple operations may require a small `from()` conversion even when their
underlying dependency is Promise-based.

## Exceptions

A service MAY return a Promise for an isolated operation when leaving the
reactive boundary is intentional and documented. A controller or integration
MAY adapt an Observable when a framework or external contract requires it, but
the conversion and ownership should remain visible.

## Examples

### Good: one reactive business flow

```ts
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  getUserDetails(userId: string): Observable<UserDetails> {
    return forkJoin({
      user: from(
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      ),
      externalUser: this.httpService
        .get<ExternalUser>(`https://api.example.com/users/${userId}`)
        .pipe(map((response) => response.data)),
    });
  }
}
```

The service composes the database and HTTP sources into one business result.

### Bad: premature conversion and leaked coordination

```ts
async getUserDetails(userId: string): Promise<UserDetails> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });
  const response = await firstValueFrom(
    this.httpService.get<ExternalUser>(
      `https://api.example.com/users/${userId}`,
    ),
  );

  return { user, externalUser: response.data };
}
```

This abandons the reactive service contract and makes composition, cancellation,
and stream-level error handling unavailable to callers without a specific
reason to leave the reactive flow.

### Preferred flow

```text
HTTP Request
     |
     v
Controller
     |
     v
Business Service
     |
     +----------------+
     v                v
 HTTP API          Prisma
 Observable        Promise
     |                |
     |             from(...)
     |                |
     +--------+-------+
              v
        RxJS Pipeline
              |
              v
       Observable<Result>
              |
              v
        HTTP Response
```

## References

- [002-reactive-http-calls.md](002-reactive-http-calls.md)
- [003-promise-to-observable-conversion.md](003-promise-to-observable-conversion.md)
- [004-service-and-controller-design.md](004-service-and-controller-design.md)
- [005-composition-vs-resilience.md](005-composition-vs-resilience.md)
