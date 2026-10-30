# Task Scheduling Rules

These Accepted rules mix NestJS scheduling implementation, cross-stack job
principles, and Kubernetes capacity guidance. A scheduler decides when work
starts; the business service or worker decides what the work does.

## Rules

| Rule | Scope | Decision |
| --- | --- | --- |
| [001-scheduler-and-business-service-boundary.md](001-scheduler-and-business-service-boundary.md) | NestJS implementation | Keep cron triggers thin and delegate business work to reusable services. |
| [002-low-traffic-scheduling-window.md](002-low-traffic-scheduling-window.md) | Cross-stack principle; schedule is project-specific | Schedule heavy work during a measured low-traffic window, with an explicit timezone and exception process. |
| [003-large-task-scalability-and-pod-capacity.md](003-large-task-scalability-and-pod-capacity.md) | Kubernetes/platform-specific | Design large scheduled treatments for bounded, observable, horizontally scalable worker capacity. |
| [004-scheduled-task-observability-and-failure-handling.md](004-scheduled-task-observability-and-failure-handling.md) | Cross-stack job principles; logger implementation is stack-specific | Give each job an identity and distinguish scheduler, business, dependency, and infrastructure failures. |

## Relationship to Other Rules

- Workload targets and decisions about when to make work asynchronous are
      project-specific; this skill has no shared performance rule set yet.
- [Reactive programming rules](../reactive-programmation/README.md) define the
  asynchronous service boundary used when scheduled work returns Observables.
- [Observability rules](../observability/README.md) define safe logs, metrics,
  traces, and error handling.
- [Testing rules](../testing-strategy/README.md) define automated verification
  for scheduled entry points and long-running workflows.

## Scheduling Checklist

Apply platform-specific items, such as pod capacity and autoscaling, only when
the deployment actually uses Kubernetes.

- [ ] The scheduler has a domain-specific name and an explicit job name.
- [ ] The scheduled method contains orchestration only and delegates business
      behavior to a reusable service or worker workflow.
- [ ] The schedule uses an explicit timezone and a documented low-traffic
      window for heavy treatments.
- [ ] The job has a concurrency and duplicate-execution strategy when more than
      one pod can run the scheduler.
- [ ] Large treatments are chunked, resumable, idempotent, and bounded by
      configured concurrency and dependency capacity.
- [ ] Worker pod resources, autoscaling signals, queue capacity, and graceful
      shutdown have been planned and tested.
- [ ] Every execution has a stable job name, execution identifier, status, and
      useful success and failure telemetry.