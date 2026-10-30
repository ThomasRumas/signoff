# Rule: Test Behavior, Failures, and Test Placement

## Status

Accepted

## Scope

This rule defines cross-cutting test quality, failure scenarios, test naming,
and file organization for API applications. Its examples reflect the current
NestJS/TypeScript profile; tools and framework-specific behavior are defined
in the relevant implementation rules.

## Context

A test suite can pass while missing failure behavior, asserting implementation
details, or becoming difficult to locate and maintain. Tests should describe
what users and collaborating components can observe and should make ownership
of test levels obvious.

## Decision

Tests MUST prioritize observable behavior and relevant failure scenarios. Test
files SHOULD be colocated with the components they cover and use conventional
`.spec` or `.test` suffixes. Unit, HTTP/integration, and end-to-end tests MUST
be labeled according to the boundary they exercise.

## Rules

- Every significant business operation MUST test relevant success and failure
  scenarios, including database failure, external-service failure, invalid
  input, missing entities, unauthorized operations, unexpected dependency data,
  asynchronous errors, and business-rule violations where applicable.
- Tests SHOULD assert returned values, thrown errors, emitted values, HTTP
  responses, and meaningful dependency interactions.
- Tests MUST NOT assert private methods, internal fields, incidental call order,
  or specific implementation details unless they are part of a meaningful
  contract.
- Unit tests exercise an isolated component and controlled dependencies.
  HTTP/integration tests exercise the API transport boundary. End-to-end tests
  exercise multiple real application components. Select their tools and
  required CI gates from the target project's documented test strategy; this
  skill currently defines no API-specific Playwright rules.
- Test files SHOULD live beside the implementation they cover. Use names such
  as `users.service.spec.ts` and `users.controller.spec.ts`.
- Test names SHOULD describe the observable behavior and scenario, not the
  private method being called.
- Tests MUST be deterministic and SHOULD avoid time, network, filesystem, and
  shared-state coupling unless those are the explicit subject of an
  integration test.
- The test suite MUST remain aligned with the implementation architecture and
  any explicit project coverage gate, such as the current profile's
  [80% minimum](005-coverage-and-quality-gates.md).

## Rationale

Failure-focused, behavior-oriented tests detect regressions that line coverage
and happy-path assertions miss. Colocation and consistent naming make tests
visible during feature work and simplify navigation for engineers and coding
agents.

## Alternatives Considered

### Test only successful execution

Happy-path tests do not establish how the system behaves when dependencies fail,
inputs are invalid, or business rules reject an operation. Relevant failures
are part of the contract.

### Assert private implementation details

These tests break during harmless refactoring and can pass while observable
behavior is wrong. Public behavior and meaningful interactions are more stable
assertion targets.

### Put all tests in one top-level directory

A central directory can work for a deliberate project convention, but it makes
ownership less visible in this strategy. Colocation is the default.

## Consequences

Tests become easier to understand and more resilient to refactoring, but teams
must identify which failures are meaningful for each operation. Colocation may
require consistent project tooling for discovering tests across feature
folders.

## Exceptions

A project MAY use a separate test directory when its framework, generated-code
layout, or build tooling requires it. The project MUST preserve clear mapping
between each test and the component or boundary it covers.

## NestJS/TypeScript Examples

### Good: behavior-oriented error test

```ts
it("propagates an external service failure", async () => {
  externalService.getUser.mockReturnValue(
    throwError(() => new ExternalServiceError()),
  );

  await expect(
    firstValueFrom(service.getUserDetails("123")),
  ).rejects.toThrow(ExternalServiceError);
});
```

The test describes an observable failure and protects error behavior.

### Good: colocated feature tests

```text
src/
└── users/
    ├── users.controller.ts
    ├── users.controller.spec.ts
    ├── users.service.ts
    ├── users.service.spec.ts
    └── users.module.ts
```

### Bad: assert a private method

```ts
expect(service["somePrivateMethod"]).toHaveBeenCalled();
```

This couples the test to an implementation detail instead of proving the
service contract.

### Bad: place a unit test behind real infrastructure

```ts
it("rejects an invalid user", async () => {
  await request("https://staging.example.com")
    .post("/users")
    .send({ email: "invalid" })
    .expect(400);
});
```

This is an environment-dependent HTTP test, not a deterministic unit test.

## References

- [001-testing-stack-and-tools.md](001-testing-stack-and-tools.md)
- [002-unit-testing-services.md](002-unit-testing-services.md)
- [003-testing-reactive-services.md](003-testing-reactive-services.md)
- [004-controller-and-http-testing.md](004-controller-and-http-testing.md)
- [005-coverage-and-quality-gates.md](005-coverage-and-quality-gates.md)
- [API testing strategy index](../README.md); API-specific Playwright and shared E2E fixture rules are not currently included in this skill.
