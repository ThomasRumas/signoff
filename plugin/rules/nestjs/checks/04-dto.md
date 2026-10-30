---
title: Request and response DTOs.
globs: ["**/*.dto.ts"]
sources:
  - engineering-rules/design/003-response-dtos-and-reactive-projections.md
  - engineering-rules/design/004-nestjs-dto-validation-and-transformation.md
  - engineering-rules/design/005-openapi-contracts-for-business-responses.md
  - engineering-rules/pagination/001-standard-pagination.md
---
- Request DTOs MUST be concrete runtime classes with validation decorators for body, query, and path values; never ORM/Prisma entities or type-only aliases.
- Validation relies on `ValidationPipe` with `transform: true` and `whitelist: true`.
- Response DTOs list their public fields explicitly, expose only fields that are useful and safe for consumers, and stay independent of persistence models. Use separate DTOs when representations have different semantics.
- Fields and constraints MUST be reflected in OpenAPI.
- Pagination query DTOs use `page` (default 1) and `pageSize` (default 30, maximum 100) and reject invalid values.
