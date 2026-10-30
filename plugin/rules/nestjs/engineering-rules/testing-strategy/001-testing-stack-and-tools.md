# Rule: Use the Standard NestJS Testing Stack

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications. It defines the
standard tools for unit, Nest integration, and HTTP-level tests.

## Context

Tests need to exercise application behavior consistently while keeping the
boundaries between test tools clear. Vitest provides the test runner and test
primitives, `@nestjs/testing` reproduces Nest dependency injection, and
Supertest sends requests to an initialized HTTP application.

## Decision

NestJS applications MUST use Vitest as the standard test runner and assertion
library, `@nestjs/testing` when testing Nest components or dependency wiring,
and Supertest for HTTP-level endpoint tests. Supertest is an HTTP test client,
not a unit-testing library.

## Rules

- Vitest MUST provide the test runner, assertions, mocks, spies, and stubs.
- Tests involving NestJS providers, controllers, modules, or injected
  dependencies SHOULD use `@nestjs/testing` to construct the test module.
- HTTP-level controller or application tests SHOULD use Supertest against an
  initialized Nest application.
- Tests MUST NOT call external infrastructure merely to validate the testing
  stack. Infrastructure dependencies should be replaced with controlled test
  doubles at the appropriate test level.
- Test type and tool ownership MUST remain clear:

  | Test level | Primary purpose | Standard tools |
  | --- | --- | --- |
  | Unit | Isolated business behavior | Vitest, `@nestjs/testing` when DI is involved |
  | HTTP/integration | HTTP contract and Nest request pipeline | Vitest, `@nestjs/testing`, Supertest |
  | End-to-end | Full deployed-like system behavior | The project's documented E2E runner and fixtures |

This API skill currently defines no dedicated Playwright or shared E2E fixture
rules. Select E2E tooling from the target project's documented test strategy.

- Projects MAY add tools for a documented integration or end-to-end requirement,
  but the addition MUST NOT replace the standard unit-test stack without a
  documented decision.

## Rationale

The tools have complementary responsibilities. Vitest keeps test execution and
assertions consistent, `@nestjs/testing` represents the Nest dependency graph,
and Supertest verifies the contract as an HTTP consumer would observe it.

## Alternatives Considered

### Use Jest as the default runner

Jest is a capable alternative, but Vitest is the project standard for new
NestJS applications under this decision. A project choosing Jest requires a
documented exception.

### Use raw class construction for every Nest component

Manual construction can be useful for a pure class, but it bypasses Nest
provider tokens, scopes, and dependency wiring. Nest components should use the
Nest testing container.

### Treat Supertest as a unit-testing tool

Supertest exercises an HTTP server boundary. It is valuable for controller and
HTTP-level tests but does not replace isolated unit tests.

## Consequences

Teams have a predictable testing stack and clear ownership between tools. Tests
that initialize Nest modules or HTTP applications require more setup than pure
function tests, so the lighter test level should be chosen when the boundary is
not part of the behavior under test.

## Exceptions

A project MAY use another runner or HTTP client for a documented compatibility,
performance, or platform requirement. The exception MUST identify which test
level is affected and how equivalent assertions, mocking, and reporting remain
available.

## Examples

### Good: construct a Nest testing module

```ts
const moduleRef = await Test.createTestingModule({
  providers: [UsersService],
}).compile();

const service = moduleRef.get(UsersService);
```

Vitest can assert the result while `@nestjs/testing` owns provider resolution.

### Good: use Supertest at the HTTP boundary

```ts
const app = moduleRef.createNestApplication();
await app.init();

await request(app.getHttpServer())
  .get("/users/123")
  .expect(200)
  .expect({ id: "123", name: "John Doe" });
```

### Bad: classify an HTTP request as a unit test

```ts
it("is a unit test", async () => {
  await request(app.getHttpServer()).get("/users/123");
});
```

This is an HTTP-level test. Calling it a unit test makes its setup, speed, and
responsibility unclear.

### Bad: bypass injected dependencies with production infrastructure

```ts
const service = new UsersService(new PrismaService());
```

An isolated service test should replace Prisma with a controlled test double;
the service-testing rule defines that pattern.

## References

- [002-unit-testing-services.md](002-unit-testing-services.md)
- [004-controller-and-http-testing.md](004-controller-and-http-testing.md)
- [005-coverage-and-quality-gates.md](005-coverage-and-quality-gates.md)
- [NestJS testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest](https://vitest.dev/)
- [Supertest](https://github.com/ladjs/supertest)
