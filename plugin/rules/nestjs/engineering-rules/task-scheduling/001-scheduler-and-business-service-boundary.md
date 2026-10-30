# Rule: Keep Scheduled Entry Points Thin

## Status

Accepted

## Scope

This rule applies to NestJS cron jobs implemented with `@nestjs/schedule` and
the `@Cron()` decorator.

## Context

The time a task runs is a technical concern. The business operation it starts
must remain reusable, testable, and independent from whether it was triggered
by cron, HTTP, a message consumer, a CLI command, or a future worker.

## Decision

Every cron job MUST be owned by a domain-specific Scheduler Service. The
Scheduler Service MUST define the schedule and orchestration, then delegate the
business operation to an existing or dedicated Business Service. A cron method
MUST NOT contain business rules, repository queries, or multi-system
composition that belongs in an application workflow.

## Rules

- Scheduler Services MUST have an explicit domain name such as
  `OrderSchedulerService`, `NotificationSchedulerService`, or
  `CleanupSchedulerService`.
- Generic services such as `TasksService`, `CronService`, or
  `SchedulerService` MUST NOT contain unrelated jobs.
- Every cron job MUST have an explicit stable name, such as
  `process-orders`.
- The schedule MUST define its timezone when the business window depends on a
  regional timezone. UTC SHOULD be used when the operation is globally timed.
- The Scheduler Service SHOULD log or emit the start and completion of the job
  and MUST report orchestration failures.
- The Business Service MUST own business rules, data transformations,
  repository access, external calls, and business-level recovery behavior.
- The business operation MUST NOT need to know why or when it was triggered.
- A scheduler MUST NOT silently swallow errors. It MUST propagate or record the
  failure according to the job's documented retry and recovery policy.
- A cron job that can run in more than one pod MUST have an explicit
  single-execution, distributed-lock, leader-election, or idempotent duplicate
  processing strategy.

## Examples

### Good: thin, named scheduler

```ts
@Injectable()
export class OrderSchedulerService {
  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: "process-orders",
    timeZone: "Europe/Paris",
  })
  async processOrders(): Promise<void> {
    await this.orderService.processPendingOrders();
  }
}
```

The scheduler chooses when to start the work. `OrderService` decides what
processing pending orders means.

### Good: reusable business operation

```ts
@Injectable()
export class OrderService {
  async processPendingOrders(): Promise<void> {
    const orders = await this.orderRepository.findPendingOrders();
    await this.orderProcessor.process(orders);
  }
}
```

The same operation can be invoked by an HTTP use case, message consumer, CLI,
or scheduled entry point without duplicating business logic.

### Bad: business logic inside `@Cron()`

```ts
@Cron("0 0 * * *")
async processOrders(): Promise<void> {
  const orders = await this.orderRepository.findPendingOrders();

  for (const order of orders) {
    if (order.total > 1000) {
      await this.paymentClient.capture(order);
    }
  }
}
```

The scheduler now owns database access, business rules, and external calls.
Delegate the operation to a Business Service instead.

## Consequences

Schedulers remain small and easy to test, while business behavior can be
reused by other entry points. Large or multi-step jobs need an explicit worker
or asynchronous processing design rather than expanding the cron method.

## References

- [002-low-traffic-scheduling-window.md](002-low-traffic-scheduling-window.md)
- [003-large-task-scalability-and-pod-capacity.md](003-large-task-scalability-and-pod-capacity.md)
- [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)