---
description: NestJS/TypeScript APIs with Prisma, RxJS, and PostgreSQL as the default database.
detect: ["@nestjs/core"]
review-marker: nestjs-best-practices
---

# API Best Practices

Use the Engineering Cookbook as the source of truth for API decisions. This
guide routes work to the relevant decision and rule set; it does not replace
the detailed cookbook documents. Start with the [scope index](engineering-rules/README.md)
to distinguish generic API rules from technology, implementation, and
platform-specific guidance.

## Workflow

1. Inspect the target project. Record its language, framework, database and
   ORM, runtime platform, and API consumers before loading implementation rules.
2. Always start with the framework-independent API references:
   - [Responsibility and business boundaries](architecture/002-api-responsibility-and-business-boundaries.md)
   - [Business-oriented API design](engineering-rules/design/001-business-oriented-api-design.md)
   - [Stable HTTP error contract](engineering-rules/observability/001-api-error-contract.md)
3. Load technology guidance for the project's stack. PostgreSQL is the default
   database: the [PostgreSQL rules](engineering-rules/database/README.md)
   apply unless a documented exception selects another database. Select and
   load an ORM profile separately.
4. Load implementation rules only for the matching stack. The current
   [NestJS/TypeScript profile](engineering-rules/README.md) includes
   Nest runtime, DTO, Prisma, RxJS, testing, and observability conventions. Do
   not apply these conventions to another framework.
5. Load platform or project rules only when the target project uses that
  context, such as Kubernetes deployment guidance.
6. Treat decision status as meaningful. Do not turn a proposed recommendation
   into a mandatory rule, silently override a validated or accepted decision,
   or hide a project-specific exception.
7. Verify at the smallest boundary that proves the change, using the project's
   actual test and operational tools.

## Generic Defaults To Preserve

- Design endpoints around consumer use cases, not persistence tables.
- Keep transport handlers focused on input/output translation; let the
  application or use-case boundary own business orchestration.
- Keep public response contracts independent of persistence models and expose
  only fields that are useful and safe for consumers.
- Let the API own aggregation when it represents an API business capability;
  do not move shared business rules into frontend clients.
- Give documented errors a stable machine-readable code and a safe,
  human-readable message. Consumers must not branch on message text.

## NestJS/TypeScript Defaults

- Keep NestJS controllers thin and put business orchestration in application
  services.
- Use PostgreSQL as the default database, accessed through Prisma.
- Keep request and response contracts in project-owned DTOs; do not expose
  Prisma or other persistence entities directly.
- Keep feature behavior separate from Nest application composition, startup,
  listener, and liveness concerns.
- Use the repository's Observable-based patterns for asynchronous flows only
  when the target project uses the NestJS/RxJS profile.
- Translate known failures at the NestJS transport boundary and keep unknown
  failures generic and safe.

When a documented project context requires a different choice, make the
deviation explicit and limit it to the affected boundary.

## Rule Sets By Scope

### Generic API rules

- [Business responsibility and boundaries](architecture/002-api-responsibility-and-business-boundaries.md)
- [Business-oriented API design](engineering-rules/design/001-business-oriented-api-design.md)
- [Stable HTTP error contract](engineering-rules/observability/001-api-error-contract.md)
- Portable contract sections also exist for [REST resource views](engineering-rules/design/002-rest-resource-and-response-views.md), [OpenAPI contracts](engineering-rules/design/005-openapi-contracts-for-business-responses.md), [API-owned aggregation](engineering-rules/design/006-backend-for-frontend-aggregation.md), [REST design conventions](engineering-rules/design/007-api-design-reference-conventions.md), and [cross-resource access](engineering-rules/design/008-cross-resource-data-access.md). Their NestJS implementations remain stack-specific.
- The [pagination contract](engineering-rules/pagination/001-standard-pagination.md), [testing principles](engineering-rules/testing-strategy/006-testing-practices-and-organization.md), and [scheduled-job principles](engineering-rules/task-scheduling/README.md) are reusable where applicable; select tools and platform behavior from the matching profile.

### Shared technology: PostgreSQL

- [PostgreSQL schema rules](engineering-rules/database/README.md) apply to the default database. They are reusable across languages and do not prescribe an ORM.
- [Database observability](engineering-rules/observability/005-database-observability.md) applies to every deployed database, whatever the observability provider.

### NestJS/TypeScript implementation

- [NestJS architecture and runtime](architecture/001-api-application-structure-and-dependency-direction.md) and [process boundaries](architecture/003-api-runtime-and-process-boundaries.md)
- [Prisma access, transactions, and migrations](engineering-rules/database/001-prisma-orm.md), [transaction management](engineering-rules/database/002-transaction-management.md), and [schema migrations](engineering-rules/database/007-schema-migrations.md)
- [API design implementations](engineering-rules/design/README.md), [error translation and service observability](engineering-rules/observability/README.md), [pagination](engineering-rules/pagination/README.md), [scheduled work](engineering-rules/task-scheduling/README.md), and [testing](engineering-rules/testing-strategy/README.md)
- [Reactive programming with RxJS](engineering-rules/reactive-programmation/README.md)

### Platform rules and recommended defaults

- [Kubernetes worker capacity](engineering-rules/task-scheduling/003-large-task-scalability-and-pod-capacity.md) applies only to Kubernetes deployments.
- The [80% coverage gate](engineering-rules/testing-strategy/005-coverage-and-quality-gates.md) is the recommended default threshold.
