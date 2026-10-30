# Observability Rules

These rules mix a generic HTTP error/log contract with NestJS logging and
controller implementations. Logging providers and database monitoring tools
are selected by each project, not mandated by this family.

## Rules

1. [001-api-error-contract.md](001-api-error-contract.md) (**generic API**)
   defines the consumer-facing HTTP status, stable error code, and
   human-readable message.
2. [002-controller-error-translation.md](002-controller-error-translation.md)
   (**NestJS/RxJS**)
   defines RxJS controller error translation and the boundary between internal
   errors and HTTP responses.
3. [003-service-error-observability.md](003-service-error-observability.md)
   (**NestJS**) defines service-level technical logging with the NestJS
   `Logger`.
4. [004-structured-access-logging.md](004-structured-access-logging.md)
   (**Generic API**) defines structured access and error record fields without
   prescribing a logger or observability provider.
5. [005-database-observability.md](005-database-observability.md)
   (**Generic API**) defines per-environment database observability and its
   correlation with API signals without prescribing a provider.

## Responsibility Matrix

| Layer | Responsibility |
| --- | --- |
| Service | Execute application logic, add technical context, and propagate errors |
| Service logger | Record technical failures and relevant execution context |
| Access/error records | Emit structured request context and safe error fields |
| Observable | Propagate values and errors through the application flow |
| Controller | Translate known failures into the public HTTP error contract |
| API error contract | Expose status, stable `errorCode`, and safe `message` |
| Consumer | Use `errorCode` for application logic and `message` for presentation |

## Review Checklist

Apply each item only when its scope matches the target project.

- [ ] Consumer-facing failures include an HTTP status, stable `errorCode`, and
      human-readable `message`.
- [ ] Consumers do not parse human-readable messages to choose behavior.
- [ ] Controllers translate known domain or application failures explicitly.
- [ ] Unknown failures are not exposed with internal messages or stack traces.
- [ ] Services use NestJS `Logger` for technical failures and propagate errors.
- [ ] Logs include useful operation context without credentials or personal data
      that is not required for diagnosis.
- [ ] Access and error logs use the structured fields defined by
   [004-structured-access-logging.md](004-structured-access-logging.md).
- [ ] Logging providers and database monitoring are configured according to
   the project's operational requirements.
- [ ] RxJS error paths are tested at the appropriate service and HTTP boundaries.

## Related Rules

- [Reactive programming rules](../reactive-programmation/README.md)
- [Controller and HTTP testing](../testing-strategy/004-controller-and-http-testing.md)
- [Testing practices and organization](../testing-strategy/006-testing-practices-and-organization.md)
- [Database transaction management](../database/002-transaction-management.md)
