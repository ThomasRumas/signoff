# Rule: Adapt Promise-Based Dependencies with `from()`

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications whose reactive business
flows use Promise-based dependencies such as Prisma, caches, or other
asynchronous services.

## Context

Not every dependency is reactive. Prisma Client APIs commonly return Promises,
while NestJS `HttpService` returns Observables. A business operation that needs
both should adapt the Promise at the composition boundary instead of making
callers coordinate incompatible abstractions.

## Decision

Promise-based asynchronous operations MUST be converted with RxJS `from()` when
they need to participate in a reactive flow. Operations that do not participate
in such a flow MAY remain Promise-based at an intentional boundary.

## Rules

- A Promise MUST be wrapped with `from()` before it is combined with other
  Observables in a reactive business operation.
- Independent asynchronous sources SHOULD be combined with `forkJoin` when the
  operation needs all of them to complete once.
- Sequential or dependent work SHOULD use operators suited to its dependency
  and concurrency semantics rather than forcing every workflow into
  `forkJoin`.
- Promise conversion MUST NOT be added solely to make an isolated Promise look
  reactive when no reactive composition is needed.
- Prisma transaction boundaries and concurrency controls remain governed by
  [database/002-transaction-management.md](../database/002-transaction-management.md).
- Resilience operators MUST NOT be applied generically to the converted
  Promise; see [005-composition-vs-resilience.md](005-composition-vs-resilience.md).

## Rationale

`from()` gives heterogeneous dependencies a common type at the point where
composition is required. Keeping isolated operations simple avoids unnecessary
RxJS ceremony while preserving a consistent service contract for combined
workflows.

## Alternatives Considered

### Coordinate Promises and Observables manually

This spreads composition logic across callers and encourages repeated
conversions. Adapting the Promise at the business composition boundary keeps
coordination in one place.

### Convert every Promise in the application

Not every operation needs reactive composition. Converting isolated Promises
adds complexity without improving their behavior.

### Use `forkJoin` for all asynchronous workflows

`forkJoin` is appropriate when sources are independent and completion values are
needed together. Dependent, streaming, or long-lived sources need different
operators and lifecycle decisions.

## Consequences

Services can combine Prisma and HTTP work under one Observable contract. The
team must choose operators based on whether work is independent, sequential,
dependent, streaming, or long-lived.

## Exceptions

A Promise MAY remain at a service or integration boundary when the operation is
isolated, the caller explicitly expects a Promise, or a library contract
requires it. The boundary should be deliberate and documented.

## Examples

### Good: compose Prisma and HTTP with `from()`

```ts
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
```

The Prisma Promise is adapted only because it participates in the combined
reactive operation.

### Bad: mix asynchronous abstractions without composition

```ts
async getUserDetails(userId: string) {
  const userPromise = this.prisma.user.findUnique({
    where: { id: userId },
  });
  const externalUser$ = this.httpService.get<ExternalUser>(
    `https://api.example.com/users/${userId}`,
  );

  return { userPromise, externalUser$ };
}
```

Callers now receive two different abstractions and must understand how to
coordinate them. The service should compose them and return one business
result.

### Good: keep an isolated Promise simple

```ts
async findUser(userId: string): Promise<User | null> {
  return this.prisma.user.findUnique({
    where: { id: userId },
  });
}
```

This isolated operation has no Observable composition requirement, so wrapping
it with `from()` would add ceremony without a benefit.

## References

- [001-reactive-programming-default.md](001-reactive-programming-default.md)
- [002-reactive-http-calls.md](002-reactive-http-calls.md)
- [005-composition-vs-resilience.md](005-composition-vs-resilience.md)
- [database/002-transaction-management.md](../database/002-transaction-management.md)
