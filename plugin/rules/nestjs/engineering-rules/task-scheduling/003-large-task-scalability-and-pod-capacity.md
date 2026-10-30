# Rule: Make Large Scheduled Treatments Horizontally Scalable

## Status

Accepted

## Scope

This rule applies to scheduled treatments that process large datasets, many
business entities, or work that may exceed one pod's practical CPU, memory,
time, database, or external-dependency capacity.

## Context

A treatment that works in a small dataset can exhaust a pod when volume grows.
Scaling pods without controlling concurrency can overload the database or
downstream APIs, and running the same cron handler on every pod can process the
same treatment multiple times.

## Decision

Large treatments MUST be designed as bounded, resumable, and idempotent work.
The scheduler SHOULD enqueue work for a dedicated worker deployment rather
than processing the entire dataset inside an API pod. Worker replicas MUST be
scalable and MUST have explicit limits for concurrency, dependency load, and
resource consumption.

## Rules

- The team MUST estimate total records, item size, expected duration, CPU,
  memory, database, network, and downstream dependency requirements before
  production scheduling.
- Large datasets MUST be processed in bounded chunks or pages. A treatment
  MUST NOT load an unbounded dataset into one pod's memory.
- Each chunk MUST have a stable identity and MUST be safe to retry. Processing
  MUST be idempotent or use a durable checkpoint and deduplication strategy.
- A treatment SHOULD use a queue or durable job store when it can outgrow one
  pod, needs retry, or benefits from horizontal workers.
- The Scheduler Service SHOULD enqueue a named treatment and return control;
  worker pods SHOULD perform the chunk processing.
- Worker concurrency MUST be bounded by configuration and MUST respect database
  connection limits, API rate limits, queue capacity, and downstream service
  budgets.
- Worker deployments MUST define CPU and memory requests and limits. Capacity
  planning MUST include the expected replica count, per-pod concurrency,
  maximum queue depth, and completion deadline.
- Horizontal Pod Autoscaling SHOULD use signals appropriate to the workload,
  such as queue depth, oldest queued item age, CPU, memory, or active work, not
  CPU alone when the job is I/O-bound.
- The scheduler MUST NOT start one unrestricted full treatment per pod. Use a
  distributed lock, leader election, a single scheduler deployment, or a
  queue-based claim mechanism.
- Workers MUST support graceful shutdown. A pod terminating during a chunk MUST
  release or requeue work safely without losing the checkpoint.
- Backpressure MUST prevent workers from overwhelming the database or external
  services. Retries MUST use bounded attempts and backoff with dead-letter or
  operator recovery behavior.
- The treatment MUST define how it behaves when it cannot finish in the
  selected low-traffic window and how the next execution avoids corrupting or
  duplicating work.
- Scaling decisions MUST be validated with production-like volume and
  dependency limits before enabling the full treatment in production.

## Processing Model

```text
Cron Scheduler
      |
      | enqueue one named treatment
      v
Durable Queue or Job Store
      |
      +------------+-------------+
      v            v             v
 Worker Pod 1  Worker Pod 2  Worker Pod N
      |            |             |
      +------------+-------------+
                   v
          Bounded, idempotent chunks
                   |
                   v
       Database and external dependencies
```

## Examples

### Good: scheduler enqueues work

```ts
@Cron("0 0 2 * * *", {
  name: "recalculate-customer-balances",
  timeZone: "Europe/Paris",
})
async recalculateBalances(): Promise<void> {
  await this.jobQueue.add(
    "recalculate-customer-balances",
    { treatmentDate: new Date().toISOString() },
    { jobId: "recalculate-customer-balances-daily" },
  );
}
```

The scheduler creates one durable job. Worker replicas claim bounded chunks
from that job.

### Good: bounded and resumable worker processing

```ts
async processCustomerBalanceChunk(
  cursor: string | undefined,
): Promise<{ nextCursor?: string }> {
  const customers = await this.customerRepository.findPage({
    cursor,
    limit: 500,
  });

  for (const customer of customers.items) {
    await this.balanceService.recalculateIfNotProcessed(customer.id);
  }

  return { nextCursor: customers.nextCursor };
}
```

The page size, checkpoint, and idempotent operation bound memory and make
retries safe.

### Good: capacity model

```text
Expected volume:       10,000,000 records
Chunk size:            500 records
Worker concurrency:    8 chunks per pod
Worker replicas:       2-20 via queue-depth autoscaling
Database connections:  4 per pod
Completion deadline:   04:00 Europe/Paris
Recovery:              retry with backoff and dead-letter queue
```

The deployment is sized from workload and dependency limits rather than an
assumption that adding pods always increases throughput.

### Bad: process everything in one pod

```ts
async processEverything(): Promise<void> {
  const records = await this.repository.findAll();
  await Promise.all(records.map((record) => this.process(record)));
}
```

This has unbounded memory and concurrency, overloads dependencies, and cannot
resume safely after a pod restart.

### Bad: run the same treatment on every pod

```ts
@Cron("0 0 2 * * *")
async runTreatment(): Promise<void> {
  await this.treatmentService.processEverything();
}
```

If five API pods register this cron, all five may start the same treatment.
Use one scheduler, a distributed lock, or a durable queue with unique job
claims.

## Consequences

Large treatments require queue or job infrastructure, worker deployments,
capacity tests, checkpoint storage, retry policy, and operational dashboards.
They can scale beyond one pod without turning every API replica into an
uncontrolled batch processor.

## References

- [002-low-traffic-scheduling-window.md](002-low-traffic-scheduling-window.md)
- [004-scheduled-task-observability-and-failure-handling.md](004-scheduled-task-observability-and-failure-handling.md)
- Performance targets and asynchronous-work thresholds are project-specific;
  this skill does not currently include a standalone performance rule set.
- [Kubernetes Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)