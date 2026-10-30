---
title: NestJS controller (transport boundary).
globs: ["**/*.controller.ts"]
sources:
  - engineering-rules/design/001-business-oriented-api-design.md
  - engineering-rules/design/002-rest-resource-and-response-views.md
  - engineering-rules/design/003-response-dtos-and-reactive-projections.md
  - engineering-rules/design/005-openapi-contracts-for-business-responses.md
  - engineering-rules/observability/002-controller-error-translation.md
  - engineering-rules/reactive-programmation/004-service-and-controller-design.md
  - engineering-rules/pagination/001-standard-pagination.md
---
- Keep handlers thin: bind and validate input, select the use case or response view, translate results and errors, and return the service result.
- Flag business workflows, persistence queries, business cleanup or derivation, and orchestration of several services in a controller.
- Flag manual `subscribe()` calls; return the service Observable when the project uses RxJS.
- Responses MUST be project-owned response DTOs, never raw ORM/Prisma entities or untyped objects.
- Translate only known business errors to documented HTTP errors with a stable `errorCode` and safe `message`; leave unknown failures to the generic safe handler. Do not map every error to one guessed status.
- Routes are noun-based resources; a collection `view` parameter is a validated enum with a documented default; no arbitrary persistence `fields` projection; no actions disguised as view queries.
- Collection endpoints use the shared paginator and return `data` plus pagination metadata.
- Request, response, pagination, and relevant error status codes MUST be documented in OpenAPI.
