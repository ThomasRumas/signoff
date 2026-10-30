# Rule: Preserve Reactive HTTP Calls in NestJS

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications that use
`@nestjs/axios`. It defines the default handling of HTTP calls made through
NestJS `HttpService`.

## Context

`HttpService` exposes HTTP requests as RxJS Observables. Immediately converting
each response into a Promise loses the common abstraction used to compose an
HTTP call with Prisma, a cache, or another asynchronous source.

## Decision

HTTP calls through NestJS MUST use the reactive `HttpService` API and SHOULD
preserve its Observable result through the business flow.

## Rules

- HTTP calls in NestJS services MUST use `HttpService` from `@nestjs/axios`
  unless a documented integration requirement prevents it.
- The response SHOULD be transformed with RxJS operators such as `map` to
  expose the useful payload rather than leaking the Axios response when the
  business contract does not need it.
- An `HttpService` Observable MUST NOT be converted to a Promise immediately
  unless the operation intentionally leaves the reactive flow and documents
  why.
- Retry, timeout, fallback, and error transformation policies MUST be chosen
  for the specific dependency and operation; they are not implied by using
  `HttpService`. See [005-composition-vs-resilience.md](005-composition-vs-resilience.md).
- HTTP Observables that participate in a larger business operation SHOULD be
  composed in the business service; controllers SHOULD NOT coordinate them
  manually.

## Rationale

Keeping HTTP calls reactive lets the business layer use one composition model
for HTTP and non-reactive dependencies. Extracting `response.data` at the
service boundary also keeps transport details out of the business contract.

## Alternatives Considered

### Convert every HTTP call to a Promise

This can be valid at an intentional integration boundary, but it removes the
Observable from reactive composition and forces later callers to adapt it
again. It is not the default.

### Call Axios directly from a NestJS service

Direct Axios usage bypasses the NestJS `HttpService` integration and creates a
second HTTP access pattern. `HttpService` is the standard API for NestJS
applications under this rule.

## Consequences

HTTP integrations have a consistent return type and compose naturally with
other asynchronous sources. Developers must understand that an Observable is
lazy from the subscriber's perspective and must choose error and resilience
behavior deliberately.

## Exceptions

A Promise MAY be returned when an external library contract, framework adapter,
or deliberately isolated operation requires it. The conversion SHOULD occur at
that boundary rather than throughout the business layer.

## Examples

### Good: preserve the `HttpService` Observable

```ts
@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}

  getUserFromExternalApi(userId: string): Observable<ExternalUser> {
    return this.httpService
      .get<ExternalUser>(`https://api.example.com/users/${userId}`)
      .pipe(map((response) => response.data));
  }
}
```

### Bad: immediately convert the HTTP call

```ts
async getUserFromExternalApi(userId: string): Promise<ExternalUser> {
  const response = await firstValueFrom(
    this.httpService.get<ExternalUser>(
      `https://api.example.com/users/${userId}`,
    ),
  );

  return response.data;
}
```

This conversion is not automatically incorrect, but it is a bad default when
the result must participate in a reactive business flow.

## References

- [001-reactive-programming-default.md](001-reactive-programming-default.md)
- [005-composition-vs-resilience.md](005-composition-vs-resilience.md)
