---
title: Application or business service.
globs: ["**/*.service.ts"]
sources:
  - architecture/002-api-responsibility-and-business-boundaries.md
  - engineering-rules/design/003-response-dtos-and-reactive-projections.md
  - engineering-rules/design/008-cross-resource-data-access.md
  - engineering-rules/observability/003-service-error-observability.md
  - engineering-rules/reactive-programmation/README.md
  - engineering-rules/database/001-prisma-orm.md
  - engineering-rules/database/002-transaction-management.md
  - engineering-rules/pagination/001-standard-pagination.md
  - engineering-rules/task-scheduling/README.md
---
- Services own use cases, orchestration, business cleanup and derivation, and typed response projections. Build response DTOs with explicit fields, not raw-object spreading.
- Services MUST NOT throw HTTP exceptions; raise domain errors and let the controller translate them.
- Access another resource through its owning service or client, never its persistence directly. Batch known multi-item reads instead of looping over single-item calls.
- When the project uses RxJS, compose asynchronous work as one Observable; flag unnecessary Promise/Observable mixing, early conversion of reactive HTTP calls, and generic retry, timeout, or fallback policies.
- Prisma: parameterize raw SQL and never concatenate untrusted input. Use a transaction only for multi-operation atomicity, pass the transaction client to every operation inside it, keep it short, and do no external calls inside it. Do not blindly retry writes or assume a transaction prevents races.
- Pagination runs in the database with identical filters for count and data, a stable deterministic order, and no load-all-then-slice.
- Do not swallow errors. Logs keep useful context and MUST NOT contain secrets or personal data.
- If the file declares `@Cron` jobs: use a domain-named scheduler service, give each job an explicit stable name and timezone, delegate business work to a business service, bound the work processed per run, and never fail silently.
