# Rule: Unit-Test Business Services in Isolation

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications. It defines unit tests
for business services and their injected dependencies.

## Context

Business services contain most application behavior: business rules, data
transformations, conditions, dependency interactions, and error handling. Unit
tests should exercise that behavior quickly and deterministically without
requiring PostgreSQL, external APIs, brokers, caches, filesystems, or third-party
services.

## Decision

Every business-critical service MUST have a unit-test suite. Unit tests MUST
replace external infrastructure with controlled test doubles and MUST focus on
observable behavior and meaningful dependency interactions.

## Rules

- Service tests MUST cover successful business scenarios, business rules,
  transformations, conditional behavior, relevant errors, and edge cases.
- A service test involving Nest dependency injection SHOULD use
  `Test.createTestingModule()` and retrieve the service with `moduleRef.get()`.
- External dependencies such as Prisma, HTTP clients, brokers, caches,
  filesystems, and SDKs MUST NOT be required to be available for an isolated
  unit test.
- A stub supplies controlled data, a mock records or controls interaction, a
  fake provides a lightweight working implementation, and a spy observes an
  existing function. Vitest's `vi.fn()` MAY be used for mocks and stubs when
  the distinction is not material.
- Test doubles SHOULD expose only the methods required by the scenario while
  preserving the dependency token and relevant method shape.
- Dependency interactions SHOULD be asserted when they are part of the
  behavior, such as passing the correct identifier or preventing a write.
- Private methods and incidental call order MUST NOT be asserted unless they
  represent a meaningful public contract.
- Tests that exercise Observable behavior SHOULD follow
  [003-testing-reactive-services.md](003-testing-reactive-services.md).

## Rationale

Isolation makes service tests fast, deterministic, and independent from
infrastructure availability. Testing through the Nest container also verifies
that the service's provider tokens and dependency wiring are represented
correctly without starting the production application.

## Alternatives Considered

### Use a real database for every service test

This makes tests slower and couples business behavior to PostgreSQL and its
availability. Database integration tests may be valuable, but they do not
replace isolated service tests.

### Instantiate the service manually in every test

Manual construction can be appropriate for a pure class, but it bypasses Nest
provider configuration. Use `@nestjs/testing` for Nest-managed services.

### Assert every internal method call

Implementation-detail assertions make refactoring expensive and do not prove
that the service behavior is correct. Assert results and meaningful external
interactions instead.

## Consequences

Service tests require maintained test-double shapes and explicit scenario
setup. In return, failures identify business behavior without the noise and
flakiness of external infrastructure.

## Exceptions

A service MAY use a real dependency in a separately labeled integration test
when the integration itself is the behavior under test. Such tests MUST NOT be
classified as isolated unit tests and SHOULD control data and cleanup.

## Examples

### Good: isolate Prisma with a provider double

```ts
const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
};

const moduleRef = await Test.createTestingModule({
  providers: [
    UsersService,
    {
      provide: PrismaService,
      useValue: prismaMock,
    },
  ],
}).compile();

const service = moduleRef.get(UsersService);
```

### Good: test behavior and a meaningful interaction

```ts
prismaMock.user.findUnique.mockResolvedValue({
  id: "123",
  name: "John Doe",
});

const result = await service.findUser("123");

expect(result).toEqual({ id: "123", name: "John Doe" });
expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
  where: { id: "123" },
});
```

### Bad: require production infrastructure

```ts
it("finds a user", async () => {
  const prisma = new PrismaService();
  const service = new UsersService(prisma);

  expect(await service.findUser("123")).toBeDefined();
});
```

This test is environment-dependent and does not isolate the business service.

### Bad: assert a private implementation detail

```ts
expect(service["loadUserFromDatabase"]).toHaveBeenCalled();
```

Prefer asserting the returned behavior or a meaningful interaction with the
injected dependency.

## References

- [001-testing-stack-and-tools.md](001-testing-stack-and-tools.md)
- [003-testing-reactive-services.md](003-testing-reactive-services.md)
- [../database/001-prisma-orm.md](../database/001-prisma-orm.md)
