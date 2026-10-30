# Rule: Keep Reactive Composition Separate from Resilience Policies

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications using RxJS, including
HTTP, Prisma, cache, messaging, and other asynchronous dependencies. It defines
how retry, timeout, fallback, and related policies are selected; it does not
replace the transaction guidance in
[database/002-transaction-management.md](../database/002-transaction-management.md).

## Context

Reactive programming represents and composes asynchronous work. Resilience
policies decide what should happen when that work fails. These are different
concerns.

A retry may be reasonable for an idempotent external read, but dangerous for a
non-idempotent write. A timeout may protect an HTTP request, but applying a
generic timeout or retry to a Prisma operation without understanding its failure
and transaction semantics can produce incorrect behavior.

## Decision

Resilience policies MUST be explicit, dependency-aware, and based on the
operation's failure mode, idempotency, side effects, and transaction semantics.
Reactive representation alone MUST NOT trigger retry, timeout, fallback, or
circuit-breaker behavior.

## Rules

- An Observable MUST NOT receive generic retry, timeout, fallback, or error
  transformation operators by default.
- Before adding retry, teams MUST evaluate whether repeating the operation is
  safe, including idempotency, partial execution, duplicate side effects, and
  error classification.
- External HTTP reads MAY use an explicit timeout and retry policy when the
  dependency contract and operation semantics make it safe.
- Generic retry and timeout operators MUST NOT be applied to Prisma operations
  by default.
- Prisma retry exceptions MUST explain the operation's idempotency, the errors
  that are retryable, and how transaction or concurrency semantics remain safe.
- A fallback value MUST NOT hide a failure when the business operation requires
  the dependency's authoritative result.
- Error transformation SHOULD preserve enough context for logging, diagnosis,
  and the API's error contract.
- Transaction and concurrency behavior MUST follow
  [database/002-transaction-management.md](../database/002-transaction-management.md);
  an Observable wrapper does not make a workflow atomic or concurrency-safe.

## Rationale

Explicit policies prevent a convenient RxJS operator from changing business
semantics invisibly. Evaluating the dependency and operation together avoids
repeating unsafe writes and avoids masking failures that the caller needs to
see.

## Alternatives Considered

### Retry every Observable

This treats all failures and side effects as equivalent. It can duplicate
writes, increase load during an outage, and obscure the original failure.

### Never retry anything

Some operations, especially idempotent external reads, benefit from a bounded
retry policy. The correct default is explicit evaluation, not a universal ban.

### Use one global resilience policy

Dependencies have different timeout, retry, error, and idempotency semantics.
Policies should be close to the operation they govern or be built from a
well-documented dependency-specific strategy.

## Consequences

Failure behavior is deliberate and reviewable. Developers must classify errors,
understand side effects, and maintain policy tests or operational evidence
where appropriate. Some transient failures will fail immediately when no safe
retry strategy exists.

## Exceptions

A shared policy MAY be introduced when all covered operations share documented
semantics and the policy makes operation-specific differences explicit. A
Prisma retry MAY be used when its safety has been evaluated and documented for
the exact operation and failure modes.

## Examples

### Good: explicit policy for an evaluated external read

```ts
getExternalUser(userId: string): Observable<ExternalUser> {
  return this.httpService
    .get<ExternalUser>(`https://api.example.com/users/${userId}`)
    .pipe(
      timeout(3000),
      retry({ count: 2, delay: 200 }),
      map((response) => response.data),
    );
}
```

The policy is bounded and attached to an external read whose retry behavior has
been evaluated with the provider's contract. The exact status codes and backoff
strategy should be selected for the provider.

### Bad: blind retry of a Prisma write

```ts
from(
  this.prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  }),
).pipe(retry(3));
```

This retries without classifying the failure or evaluating database and
transaction semantics. The fact that the operation is represented as an
Observable does not make the retry safe.

### Bad: hide an authoritative dependency failure

```ts
return this.externalService.getAccount(accountId).pipe(
  catchError(() => of({ status: "ACTIVE" })),
);
```

Returning a fabricated fallback can make the API report an incorrect account
state. A fallback is appropriate only when the business contract explicitly
defines that degraded result.

## References

- [001-reactive-programming-default.md](001-reactive-programming-default.md)
- [002-reactive-http-calls.md](002-reactive-http-calls.md)
- [003-promise-to-observable-conversion.md](003-promise-to-observable-conversion.md)
- [004-service-and-controller-design.md](004-service-and-controller-design.md)
- [database/002-transaction-management.md](../database/002-transaction-management.md)
