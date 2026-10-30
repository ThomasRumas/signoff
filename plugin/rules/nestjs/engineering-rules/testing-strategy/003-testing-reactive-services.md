# Rule: Test Observable Behavior Directly

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications whose business services
return RxJS Observables, as defined by
[reactive-programmation/001-reactive-programming-default.md](../reactive-programmation/001-reactive-programming-default.md).

## Context

Reactive services can emit values, complete, error, and coordinate multiple
asynchronous sources. Converting production Observables to Promises solely to
make them easier to test hides those behaviors and can leave composition paths
untested.

## Decision

Tests MUST validate the Observable behavior exposed by a reactive service.
Tests MUST focus on emitted values, completion, errors, and source composition
that are relevant to the service contract rather than on the implementation of
individual RxJS operators.

## Rules

- A single-result Observable MAY be asserted with `firstValueFrom` when the
  service contract guarantees a value and completion behavior is not itself
  under test.
- Tests for multi-value services MUST assert the relevant sequence, completion,
  cancellation, or subscription behavior.
- Observable errors MUST be tested explicitly, including which dependency
  failure reaches the service boundary and how it is transformed.
- Reactive service tests MUST mock each external source and MUST NOT make real
  HTTP or database calls as part of an isolated test.
- Tests combining Promise-based dependencies with Observables SHOULD configure
  the Promise mock and Observable mock independently, then assert the composed
  business result.
- When production code adapts a Promise with RxJS `from()`, tests SHOULD
  exercise the resulting Observable contract rather than bypassing that
  composition in the service implementation.
- Tests SHOULD verify behavior when one required source fails and SHOULD avoid
  asserting private operator choice such as whether `mergeMap` or `switchMap`
  was used unless concurrency behavior is part of the contract.
- Promise adaptation in production code follows
  [reactive-programmation/003-promise-to-observable-conversion.md](../reactive-programmation/003-promise-to-observable-conversion.md).

## Rationale

Testing at the Observable boundary protects the behavior that callers observe:
values, timing-relevant completion, errors, and composition. It also keeps
reactive tests aligned with the application's reactive architecture.

## Alternatives Considered

### Convert every Observable to a Promise in production

This discards useful stream semantics to simplify one test style. Tests should
adapt their assertions to the service contract instead.

### Assert only the first emitted value

This misses later values, completion, and errors for streams that emit more
than once. Use collection or subscription assertions when those behaviors
matter.

### Test each RxJS operator implementation detail

Operator-level assertions are brittle and do not prove the business result.
Test the observable behavior and only assert concurrency or cancellation when
that behavior is externally meaningful.

## Consequences

Reactive tests require familiarity with RxJS assertion patterns and explicit
handling of asynchronous completion and errors. They provide better protection
for composed business flows and avoid changing production abstractions for test
convenience.

## Exceptions

A test MAY adapt an Observable with `firstValueFrom` or another helper when the
service contract is intentionally a single result. The test MUST still preserve
any relevant error or completion assertions.

## Examples

### Good: assert one Observable result

```ts
it("returns the user", async () => {
  const result = await firstValueFrom(service.getUser("123"));

  expect(result).toEqual(expectedUser);
});
```

### Good: test a composed Prisma and HTTP flow

```ts
externalService.getUser.mockReturnValue(of(externalUser));
prismaMock.user.findUnique.mockResolvedValue(databaseUser);

const result = await firstValueFrom(
  service.getUserDetails("123"),
);

expect(result).toEqual({
  user: databaseUser,
  externalUser,
});
```

### Good: assert multiple emissions and completion

```ts
const emissions: number[] = [];

await new Promise<void>((resolve, reject) => {
  service.updates$().subscribe({
    next: (value) => emissions.push(value),
    error: reject,
    complete: resolve,
  });
});

expect(emissions).toEqual([1, 2, 3]);
```

### Bad: ignore the Observable contract

```ts
it("returns updates", async () => {
  const result = await firstValueFrom(service.updates$());

  expect(result).toBe(1);
});
```

If the service emits multiple updates, this test ignores later values and
completion behavior.

### Good: assert dependency error propagation

```ts
externalService.getUser.mockReturnValue(
  throwError(() => new ExternalServiceError()),
);

await expect(
  firstValueFrom(service.getUserDetails("123")),
).rejects.toThrow(ExternalServiceError);
```

## References

- [002-unit-testing-services.md](002-unit-testing-services.md)
- [../reactive-programmation/001-reactive-programming-default.md](../reactive-programmation/001-reactive-programming-default.md)
- [../reactive-programmation/003-promise-to-observable-conversion.md](../reactive-programmation/003-promise-to-observable-conversion.md)
