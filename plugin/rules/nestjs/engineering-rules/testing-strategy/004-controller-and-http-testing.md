# Rule: Test HTTP Contracts at the Controller Boundary

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications. It defines HTTP-level
controller tests using `@nestjs/testing`, Vitest, and Supertest.

## Context

Service tests answer whether business behavior is correct. HTTP-level tests
answer whether the application exposes that behavior correctly to consumers.
The HTTP layer adds routes, parameter parsing, validation, status codes,
serialization, and error mapping that a service unit test cannot verify.

## Decision

Controllers and application endpoints MUST have tests for their externally
observable HTTP contract. These tests SHOULD initialize a Nest testing
application and use Supertest, while mocking the service when business logic
is not the subject of the test.

## Rules

- HTTP tests MUST cover the relevant HTTP method, route, parameters, query
  values, request body, response status, response structure, and serialization.
- When an endpoint supports response views, HTTP tests MUST cover the default
  view and each supported view, including their distinct DTO fields and
  serialization. For example, `GET /products`,
  `GET /products?view=summary`, and `GET /products?view=full` MUST remain
  consistent with the documented contract.
- Error responses MUST be tested when the controller maps service or validation
  errors to a meaningful HTTP contract.
- Controller tests SHOULD verify a meaningful service interaction without
  duplicating the service's complete business-rule matrix.
- HTTP tests MUST use `@nestjs/testing` to construct the Nest application when
  testing Nest controller behavior and SHOULD use Vitest for assertions.
- Supertest SHOULD be used for requests against the initialized Nest HTTP
  server. It MUST be described as an HTTP-level or integration test, not as a
  unit test.
- Direct controller method tests MAY be used for a pure mapping helper, but
  they MUST NOT replace an HTTP test for routes, pipes, guards, interceptors,
  serialization, or status behavior.
- Full end-to-end tests with real infrastructure are outside this rule and MAY
  be added by a project with a documented system-level requirement.

## Rationale

Testing through the HTTP boundary protects what API consumers actually see
without repeating every business scenario already covered by service tests.
Mocking the service keeps the controller test focused and makes failures easier
to localize.

## Alternatives Considered

### Test only controller methods directly

Direct calls bypass routing, parameter handling, Nest pipes, serialization,
status codes, and exception filters. They are insufficient for the HTTP
contract.

### Repeat all service tests through HTTP

This increases runtime and duplication while making failures harder to locate.
Service tests should own the business-rule matrix; HTTP tests should own the
boundary contract.

### Use Supertest for isolated service unit tests

Supertest requires an HTTP server and therefore tests a larger boundary. Use
Vitest and controlled doubles for isolated service behavior.

## Consequences

HTTP tests take more setup than unit tests but catch contract regressions that
unit tests cannot. Teams must decide which service result and error mappings
are representative without turning controller tests into duplicate business
suites.

## Exceptions

A project MAY use a different HTTP client when Supertest cannot represent a
required protocol or transport. The test MUST retain equivalent assertions for
request handling and the external HTTP contract.

## Examples

### Good: test the endpoint contract

```ts
const moduleRef = await Test.createTestingModule({
  controllers: [UsersController],
  providers: [
    {
      provide: UsersService,
      useValue: {
        findUser: vi.fn().mockResolvedValue({
          id: "123",
          name: "John Doe",
        }),
      },
    },
  ],
}).compile();

const app = moduleRef.createNestApplication();
await app.init();

await request(app.getHttpServer())
  .get("/users/123")
  .expect(200)
  .expect({ id: "123", name: "John Doe" });
```

This verifies routing, the parameter, status, and serialized response without
retesting the service's internal business rules.

### Good: test meaningful error mapping

```ts
usersService.findUser.mockRejectedValue(new UserNotFoundError());

await request(app.getHttpServer())
  .get("/users/missing")
  .expect(404);
```

### Good: test supported response views

```ts
await request(app.getHttpServer())
  .get("/products?view=summary")
  .expect(200)
  .expect([{ id: "123", name: "Cordless drill", price: 129.99 }]);

await request(app.getHttpServer())
  .get("/products?view=full")
  .expect(200)
  .expect([{ id: "123", name: "Cordless drill", description: "18V cordless drill" }]);
```

These assertions protect the consumer-facing DTOs. The exact fixture may
contain additional documented fields, but a summary response MUST NOT silently
expand into the full response.

### Bad: test only a direct method call

```ts
expect(
  await controller.getUserDetails("123"),
).toEqual(expectedUser);
```

This does not verify the route, HTTP method, status, serialization, or Nest
request pipeline.

### Bad: duplicate the service's complete business matrix

```ts
it.each(allPricingRules)("retests pricing rule %s through HTTP", async (rule) => {
  // Repeating every service scenario here makes controller tests slow and
  // obscures the HTTP contract they should protect.
});
```

### Bad: test only one representation

```ts
await request(app.getHttpServer())
  .get("/products")
  .expect(200);
```

This does not protect the default, summary, and full response contracts from
drifting apart or exposing fields unintentionally.

## References

- [001-testing-stack-and-tools.md](001-testing-stack-and-tools.md)
- [002-unit-testing-services.md](002-unit-testing-services.md)
- [005-coverage-and-quality-gates.md](005-coverage-and-quality-gates.md)
- [NestJS testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/ladjs/supertest)
