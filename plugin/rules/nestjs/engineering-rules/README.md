# API Engineering Rule Catalog

Use this index to load rules by scope. A technology being reusable across
languages does not make it a universal API requirement. Statuses and exceptions
remain defined by each linked decision.

## Generic API Guidance

These rules define API responsibilities and public contracts without requiring
a particular language or framework.

- [Responsibility and business boundaries](../architecture/002-api-responsibility-and-business-boundaries.md)
- [Business-oriented API design](design/001-business-oriented-api-design.md)
- [Stable HTTP error contract](observability/001-api-error-contract.md)

## Portable Sections in Mixed References

These rules contain contracts or principles that transfer across stacks. Their
NestJS examples, libraries, and runtime mechanisms remain implementation-
specific; consult each topic index for the boundary.

- [REST resource and response views](design/002-rest-resource-and-response-views.md)
- [OpenAPI contracts](design/005-openapi-contracts-for-business-responses.md)
- [API-owned aggregation](design/006-backend-for-frontend-aggregation.md)
- [Cross-resource access](design/008-cross-resource-data-access.md)
- [Pagination contract](pagination/001-standard-pagination.md)
- [Testing quality principles](testing-strategy/006-testing-practices-and-organization.md)
- [Scheduling windows](task-scheduling/002-low-traffic-scheduling-window.md) and [job identity/failure principles](task-scheduling/004-scheduled-task-observability-and-failure-handling.md)

## Shared Technology: PostgreSQL

PostgreSQL is the default relational database for NestJS APIs. Another
database requires a documented exception. The schema rules are reusable across
languages; their Prisma examples illustrate the current TypeScript
implementation and do not prescribe the ORM.

- [Relational modeling](database/003-relational-modeling.md)
- [Data integrity](database/004-data-integrity.md)
- [Data types and timestamps](database/005-data-types-and-timestamps.md)
- [Indexes](database/006-indexes.md)
- [Database rule index](database/README.md)

## NestJS / TypeScript Implementation

Load these references only for projects using the corresponding stack. Prisma
is the selected TypeScript ORM here; it is not an API-wide or PostgreSQL-wide
requirement.

### NestJS

- [Application structure](../architecture/001-api-application-structure-and-dependency-direction.md)
- [Runtime and process boundaries](../architecture/003-api-runtime-and-process-boundaries.md)
- [NestJS API design implementations](design/README.md), except the generic
  business-oriented rule above
- NestJS-specific error translation and service logging from
  [observability rules](observability/README.md)
- [Pagination](pagination/README.md)
- [Scheduled work](task-scheduling/README.md)
- [Testing strategy](testing-strategy/README.md)
- [Reactive programming with RxJS](reactive-programmation/README.md)

### TypeScript / Prisma

- [Prisma ORM choice](database/001-prisma-orm.md)
- [Prisma transaction management](database/002-transaction-management.md)
- [Prisma schema migrations](database/007-schema-migrations.md)

## Platform and Project-Specific Guidance

Apply platform guidance only when the target project runs on the named
platform. Project policies are recommended defaults that a project may tune.

- **Kubernetes:** [large-task worker capacity](task-scheduling/003-large-task-scalability-and-pod-capacity.md)
- **Quality policy:** [80% statement-coverage gate](testing-strategy/005-coverage-and-quality-gates.md) (recommended default)

## Adding Another Implementation

For another language or framework, keep the generic API rules and any selected
technology rules, then add a separate implementation profile. For example, a
future Python profile may define SQLAlchemy usage without duplicating the
business API or PostgreSQL guidance.