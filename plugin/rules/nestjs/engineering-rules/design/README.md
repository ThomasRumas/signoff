# API Design Rules

These Accepted rules cover API contracts at different scopes. The scope column
distinguishes framework-independent decisions from NestJS implementations.
They complement the reactive, database, observability, and testing rules
rather than replacing them.

## Rules

| Rule | Scope | Decision |
| --- | --- | --- |
| [001-business-oriented-api-design.md](001-business-oriented-api-design.md) | Generic API | Design API operations around consumer use cases, not database tables. |
| [002-rest-resource-and-response-views.md](002-rest-resource-and-response-views.md) | Portable contract; implementation details are stack-specific | Keep resource URLs stable and select supported collection representations with `view`. |
| [003-response-dtos-and-reactive-projections.md](003-response-dtos-and-reactive-projections.md) | NestJS/RxJS | Clean and project raw data in typed business-service methods that return Observables. |
| [004-nestjs-dto-validation-and-transformation.md](004-nestjs-dto-validation-and-transformation.md) | NestJS/TypeScript | Use project-owned DTO classes with NestJS `ValidationPipe`, `class-validator`, and `class-transformer`. |
| [005-openapi-contracts-for-business-responses.md](005-openapi-contracts-for-business-responses.md) | Portable contract; NestJS tooling | Keep request, response, view, and status contracts visible in OpenAPI. |
| [006-backend-for-frontend-aggregation.md](006-backend-for-frontend-aggregation.md) | NestJS/RxJS implementation; BFF principle is portable and latency targets are contextual | Aggregate repeated multi-service frontend workflows behind one API-owned route. |
| [007-api-design-reference-conventions.md](007-api-design-reference-conventions.md) | Generic REST API | Use versioned plural noun resources, lower camel case, documented query conventions, and precise HTTP methods and status codes. |
| [008-cross-resource-data-access.md](008-cross-resource-data-access.md) | Portable ownership principle; NestJS implementation | Access another resource through its owning service and use batch retrieval to avoid N+1 queries. |

## Relationship to Other Rules

- [Reactive programming](../reactive-programmation/README.md) defines the
  `Observable` boundary and service/controller lifecycle.
- [Database rules](../database/README.md) define persistence concerns. Database
  models MUST NOT become public API contracts automatically.
- [Observability rules](../observability/README.md) define safe error and log
  handling.
- Performance targets for materially different endpoint workloads and
  response shapes are project-specific; this skill has no shared performance
  rule set yet.
- [Testing rules](../testing-strategy/README.md) define HTTP contract and E2E
  verification.

## NestJS/TypeScript Design Checklist

- [ ] The endpoint serves a documented business or frontend use case.
- [ ] The response uses a project-owned DTO, not a persistence entity.
- [ ] Collection views use the documented `view` enum when representations
      differ.
- [ ] Business cleanup, composition, and derivation happen in a service.
- [ ] The controller selects the use case and returns its Observable without a
      manual subscription.
- [ ] Request DTOs use `class-validator` and NestJS `ValidationPipe`.
- [ ] `class-transformer` behavior is explicit for transformation or
      serialization.
- [ ] OpenAPI documents the request, response, view options, and status codes.
- [ ] Each materially different response shape is tested and measured.
- [ ] A frontend workflow that needs data from roughly 3-4 business services
  has been reviewed for an API-owned aggregate route.
- [ ] An aggregate route has one owner, one public DTO, explicit authorization
  and failure behavior, and parallel reactive composition where safe.
- [ ] Aggregate request and dependency latency are observable and measured
  against the applicable performance target.