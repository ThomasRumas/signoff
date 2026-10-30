# Testing Strategy Rules

These rules mix reusable testing principles with NestJS/TypeScript tooling and
project-specific quality gates. Use the lightest test boundary that verifies
the behavior; select tools and gates according to the target stack and project.

## Rules

1. [001-testing-stack-and-tools.md](001-testing-stack-and-tools.md) defines
      the current NestJS/TypeScript test tools: Vitest, `@nestjs/testing`, and
      Supertest.
2. [002-unit-testing-services.md](002-unit-testing-services.md) combines
      reusable isolation and behavior-testing principles with NestJS dependency
      injection examples.
3. [003-testing-reactive-services.md](003-testing-reactive-services.md) is
      specific to RxJS Observable values, completion, errors, and composition.
4. [004-controller-and-http-testing.md](004-controller-and-http-testing.md)
      defines the current NestJS HTTP contract test setup with Supertest.
5. [005-coverage-and-quality-gates.md](005-coverage-and-quality-gates.md)
      defines the project-specific 80% statement-coverage gate and CI enforcement.
6. [006-testing-practices-and-organization.md](006-testing-practices-and-organization.md)
      defines reusable testing principles with current NestJS examples.

## Test Levels and Tools

| Test level | Boundary | Standard tools |
| --- | --- | --- |
| Unit | Isolated service or component | Vitest, `@nestjs/testing` for Nest DI |
| HTTP/integration | Initialized Nest HTTP application | Vitest, `@nestjs/testing`, Supertest |

Supertest is an HTTP-level test client, not a unit-testing library.

## Review Checklist

The tool and coverage choices below describe the current profile; do not apply
them to another stack without an explicit project decision.

Before adding or reviewing tests, verify:

- [ ] Every business-critical service has an isolated unit-test suite.
- [ ] Prisma, HTTP APIs, brokers, caches, filesystems, and SDKs are controlled
      by test doubles in unit tests.
- [ ] Nest dependencies are configured through `Test.createTestingModule()`
      when dependency injection is part of the behavior.
- [ ] Observable services test emitted values, relevant completion, errors, and
      composed dependencies directly.
- [ ] HTTP tests verify routes, parameters, status, serialization, response
      shape, and relevant error mapping.
- [ ] Significant operations cover meaningful success and failure scenarios.
- [ ] Assertions target behavior and meaningful interactions, not private
      implementation details.
- [ ] Tests are colocated with the implementation or follow a documented
      equivalent organization.

## Related Rules

- [Reactive programming rules](../reactive-programmation/README.md)
- [Prisma ORM rule](../database/001-prisma-orm.md)
- [Database transaction rule](../database/002-transaction-management.md)
