# Rule: Observe and Recover Scheduled Task Executions

## Status

Accepted

## Scope

This rule applies to scheduler execution logs, metrics, traces, retries,
failure classification, manual operations, and scheduled treatment recovery.

## Context

A scheduled job can fail before it invokes the Business Service, during
business processing, in a dependency, or because infrastructure cannot provide
enough capacity. Without a stable job identity and execution state, operators
cannot distinguish these failures or determine whether work was completed.

## Decision

Every scheduled job MUST have a stable job name, an execution identifier, an
observable lifecycle, and a documented retry and recovery policy. Telemetry
MUST distinguish scheduler/orchestration failures, business failures,
dependency failures, and infrastructure or capacity failures.

## Rules

- Every job MUST have an explicit name such as `process-orders` and every run
  MUST have a unique execution identifier.
- Start, completion, skip, retry, partial completion, and failure states MUST
  be observable.
- Logs, metrics, and traces SHOULD include `job.name`, `job.execution_id`,
  scheduled timestamp, actual start timestamp, duration, outcome, processed
  count, failed count, and retry count where applicable.
- Scheduler failure MUST be distinguishable from Business Service failure. A
  scheduler failure means orchestration did not start or submit the work; a
  business failure means the operation started but failed during execution.
- Dependency failures and capacity failures MUST identify the affected
  dependency or resource without exposing credentials or sensitive payloads.
- The Scheduler Service MUST log useful context and MUST propagate errors or
  apply a documented recovery behavior. It MUST NOT silently swallow errors.
- Retries MUST be bounded, use appropriate backoff, and avoid creating
  duplicate treatments. Non-retryable failures MUST be recorded for operator
  action.
- Large jobs MUST expose progress, checkpoint, queue depth, oldest work age,
  throughput, and estimated completion where the processing model supports it.
- A missed or skipped low-traffic execution MUST be visible and MUST have a
  documented replay or next-run policy.
- Operators MUST be able to pause, resume, replay, or cancel a treatment when
  the job design supports those actions. These actions MUST be authorized and
  audited.
- Logs and telemetry MUST NOT contain passwords, access tokens, authorization
  headers, secret values, or unnecessary personal data.

## Examples

### Good: classify and propagate scheduler errors

```ts
@Injectable()
export class OrderSchedulerService {
  private readonly logger = new Logger(OrderSchedulerService.name);

  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: "process-orders",
    timeZone: "Europe/Paris",
  })
  async processOrders(): Promise<void> {
    const executionId = randomUUID();
    const startedAt = new Date().toISOString();

    this.logger.log({
      event: "scheduled_task_started",
      jobName: "process-orders",
      executionId,
      scheduledAt: startedAt,
    });

    try {
      await this.orderService.processPendingOrders({ executionId });
      this.logger.log({
        event: "scheduled_task_completed",
        jobName: "process-orders",
        executionId,
      });
    } catch (error) {
      this.logger.error({
        event: "scheduled_task_failed",
        jobName: "process-orders",
        executionId,
        failureLayer: "business_or_dependency",
        error: error instanceof Error ? error.stack : String(error),
      });
      throw error;
    }
  }
}
```

The implementation should adapt the structured payload to the repository's
logger conventions while keeping credentials and sensitive payloads out.

### Good: useful treatment metrics

```text
job.name = "recalculate-customer-balances"
job.execution_id = "execution-123"
job.status = "running"
job.items_processed = 250000
job.items_failed = 12
job.queue_oldest_item_age_seconds = 45
job.retry_count = 1
```

These metrics help operators determine whether additional worker capacity is
needed and whether the treatment will meet its completion deadline.

### Bad: silently swallow a failed treatment

```ts
try {
  await this.orderService.processPendingOrders();
} catch {
  return;
}
```

This reports neither failure nor recovery and can make a partial treatment look
successful.

### Bad: log sensitive execution context

```ts
logger.error(`Job failed with token ${accessToken}`, error);
```

The job identifier and safe operational context are sufficient; credentials
must never enter logs or telemetry.

## Consequences

Scheduled work becomes diagnosable and recoverable, but teams must maintain
execution state, dashboards, alerting, retry policies, and operator controls.
The extra telemetry is necessary for safely running large treatments at scale.

## References

- [001-scheduler-and-business-service-boundary.md](001-scheduler-and-business-service-boundary.md)
- [003-large-task-scalability-and-pod-capacity.md](003-large-task-scalability-and-pod-capacity.md)
- [Observability rules](../observability/README.md)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)