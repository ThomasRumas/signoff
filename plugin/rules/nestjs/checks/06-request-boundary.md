---
title: Error and request boundary (exception filters, interceptors, middleware).
globs: ["**/*.{filter,interceptor,middleware}.ts"]
sources:
  - engineering-rules/observability/001-api-error-contract.md
  - engineering-rules/observability/002-controller-error-translation.md
  - engineering-rules/observability/004-structured-access-logging.md
  - architecture/003-api-runtime-and-process-boundaries.md
---
- Consumer errors return the HTTP status, a stable machine-readable `errorCode`, and a safe human-readable `message`. Consumers must not need to branch on message text.
- Unknown failures MUST return a generic safe error and never expose stack traces, SQL, or internal details.
- Structured access and error logs include a UTC timestamp, uppercase HTTP method, and route template (not the concrete path with IDs); error records add the code and message. Do not log secrets or sensitive data, and do not encode structured logs as free-form text.
- Apply global request behavior at the application boundary, not repeatedly in feature modules.
