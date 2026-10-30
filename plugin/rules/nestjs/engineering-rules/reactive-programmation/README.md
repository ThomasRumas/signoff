# Reactive Programming Rules

These rules define the default reactive programming model for NestJS TypeScript
API applications. Use Observables for asynchronous business flows, compose
heterogeneous dependencies explicitly, and keep resilience policies specific
to the operation and dependency.

## Rules

1. [001-reactive-programming-default.md](001-reactive-programming-default.md)
   defines Observables as the standard abstraction for asynchronous business
   flows.
2. [002-reactive-http-calls.md](002-reactive-http-calls.md) defines reactive
   HTTP calls through NestJS `HttpService`.
3. [003-promise-to-observable-conversion.md](003-promise-to-observable-conversion.md)
   defines how Promise-based dependencies participate in reactive composition.
4. [004-service-and-controller-design.md](004-service-and-controller-design.md)
   defines service and controller Observable boundaries.
5. [005-composition-vs-resilience.md](005-composition-vs-resilience.md)
   separates reactive composition from retry, timeout, fallback, and other
   resilience policies.

Business-oriented response DTOs and reactive projections are defined in the
[API design rules](../design/README.md), especially
[003-response-dtos-and-reactive-projections.md](../design/003-response-dtos-and-reactive-projections.md).

## Review Checklist

Before adding asynchronous business behavior, verify:

- [ ] The operation uses an Observable when it participates in an asynchronous
      business flow.
- [ ] HTTP calls use NestJS `HttpService` and preserve its Observable result
      when composition is required.
- [ ] Promise-based dependencies are adapted with `from()` when combined with
      Observables.
- [ ] The business service owns composition and returns one business result.
- [ ] The business service maps raw data to a typed public response DTO when
      the operation serves an HTTP consumer.
- [ ] The controller delegates and does not manually subscribe for a normal
      HTTP response.
- [ ] Retry, timeout, fallback, and error policies are explicit and
      dependency-aware.
- [ ] Prisma operations do not receive generic retry or timeout without an
      evaluation of idempotency, failure modes, and transaction semantics.
- [ ] Background subscriptions, cancellation, errors, and cleanup have an
      explicit owner when manual subscription is necessary.

The linked rules contain the detailed rationale and good/bad examples.
