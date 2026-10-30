# Rule: Schedule Heavy Treatments During Measured Low Traffic

## Status

Accepted

## Scope

This rule applies to scheduled treatments that consume meaningful database,
CPU, memory, network, dependency, or worker capacity.

## Context

Heavy scheduled work can compete with interactive API traffic and increase
latency, timeouts, lock contention, and dependency load. Running at night is a
useful default when users and upstream consumers are usually inactive, but
night-time is not automatically a safe window for every business or timezone.

## Decision

Heavy treatments SHOULD run during the measured lowest-traffic window,
normally at night, after considering business calendars, batch dependencies,
maintenance windows, data freshness, and regional timezones. The schedule MUST
use an explicit timezone and MUST document the evidence supporting the chosen
window.

## Rules

- The owning team MUST identify the expected traffic window, treatment duration,
  resource profile, and affected dependencies before choosing a schedule.
- A heavy treatment SHOULD be scheduled during a low-traffic night window when
  traffic data confirms that this reduces contention.
- Teams MUST NOT assume that night means no traffic. Global consumers,
  operations teams, integrations, end-of-month processing, and regional users
  may remain active.
- The schedule MUST define its timezone explicitly. A local business window
  SHOULD use an IANA timezone such as `Europe/Paris`, not an ambiguous server
  timezone.
- Daylight-saving changes MUST be considered when a local-time schedule is
  used. UTC MAY be preferable for globally uniform operations.
- The job MUST have a documented policy for holidays, month-end, quarter-end,
  sales events, planned maintenance, and dependency batch windows.
- A job MUST have a way to pause, skip, or reschedule an execution when the
  selected window is unsafe. Skipping MUST be observable and MUST define how
  missed work is recovered.
- Low-traffic scheduling MUST NOT replace capacity planning. The infrastructure
  MUST still be able to process the treatment within its expected completion
  window if traffic is higher than forecast.
- Schedule changes MUST be reviewed when traffic patterns, business hours,
  dependency limits, or treatment volume materially change.

## Examples

### Good: explicit regional night window

```ts
@Cron("0 0 2 * * *", {
  name: "rebuild-product-search-index",
  timeZone: "Europe/Paris",
})
async rebuildProductSearchIndex(): Promise<void> {
  await this.searchIndexService.rebuild();
}
```

The team has measured that 02:00 to 04:00 Europe/Paris is normally the lowest
traffic window and has documented how to pause the job during major events.

### Good: UTC for a globally timed job

```ts
@Cron("0 0 1 * * *", {
  name: "daily-data-retention",
  timeZone: "UTC",
})
async runRetention(): Promise<void> {
  await this.retentionService.removeExpiredData();
}
```

The operation is governed by a global UTC retention policy rather than a local
user activity window.

### Bad: assume midnight is always safe

```ts
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async runLargeTreatment(): Promise<void> {
  await this.treatmentService.processEverything();
}
```

This has no timezone, traffic evidence, workload bound, or missed-run policy.

## Consequences

Choosing a measured low-traffic window reduces contention with interactive
traffic but does not remove the need for scaling, throttling, and recovery.
Teams must monitor whether the window remains valid and must coordinate with
business and dependency owners.

## References

- [001-scheduler-and-business-service-boundary.md](001-scheduler-and-business-service-boundary.md)
- [003-large-task-scalability-and-pod-capacity.md](003-large-task-scalability-and-pod-capacity.md)
- [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)