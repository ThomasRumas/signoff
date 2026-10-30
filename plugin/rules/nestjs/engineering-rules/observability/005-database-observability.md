# Rule: Configure Database Observability

## Status

Accepted

## Scope

This rule applies to API applications that use a database. It covers the
database observability configuration required to detect database bottlenecks
and relate them to API behavior, regardless of the observability platform the
project uses.

## Context

API logs can show that a request is slow, but they cannot by themselves explain
whether the delay comes from a query, database resource contention, connection
pool pressure, locking, or another database dependency. Without database-level
signals, teams may optimize the API layer while the actual bottleneck remains
in the database.

The project's database observability integration (for example a managed
database's monitoring, a database APM agent, or exported database metrics)
must be enabled so operators can investigate database behavior alongside API
logs in the project's observability platform.

## Decision

Every API using a database MUST configure database observability for each
deployed environment. The configuration MUST make database activity
diagnosable and MUST support identifying slow queries or other database
bottlenecks and correlating them with the affected API service.

## Rules

- Database observability MUST be enabled as part of environment or
  deployment configuration, not only manually after an incident.
- The configuration MUST identify the API service, environment, and
  database instance or logical database being observed.
- Database observability SHOULD expose query latency and failure signals and,
  where supported by the integration, connection-pool pressure, locks,
  waits, throughput, and resource saturation.
- Slow-query thresholds and alerts SHOULD be defined for the workload's normal
  latency and reviewed when the workload changes.
- Database signals MUST be correlated with the API service and request
  observability where the platform supports correlation identifiers or shared
  service and environment tags.
- Database credentials and connection strings MUST remain in the approved
  secret-management path and MUST NOT be written to application logs or
  telemetry fields.
- Database observability configuration MUST be consistent across local,
  non-production, and production environments, with thresholds adjusted only
  when the environment's workload justifies it.
- Teams MUST use database signals when investigating API latency, elevated
  error rates, timeouts, or throughput regressions before attributing the
  issue to application code alone.
- Database observability MUST complement, and MUST NOT replace, the structured
  API logging defined in
  [004-structured-access-logging.md](004-structured-access-logging.md).

## Rationale

Database bottlenecks are often invisible at the controller or service log
level. Database observability provides the database-side perspective needed to
locate the source of latency and correlate it with the API operation that
experienced it. Configuring it as part of deployment makes observability
repeatable instead of incident-dependent.

## Alternatives Considered

### Observe only API request duration

Request duration identifies a symptom but cannot distinguish database latency
from application processing, network delay, or external dependency time.

### Add ad hoc SQL timing logs in every service

Application-level timing can be useful for a narrow investigation, but it is
inconsistent, duplicates database instrumentation, and cannot reliably expose
resource contention or database-wide bottlenecks.

### Configure database observability only in production

Production is important, but non-production configuration is required to
reproduce and diagnose performance regressions before release. Environment
specific thresholds can be used without removing the observability integration.

## Consequences

Operators can investigate API and database signals together and identify
bottlenecks earlier. Teams must manage database observability configuration
per environment, choose meaningful thresholds, and control access to database
telemetry because it may reveal sensitive workload information.

## Exceptions

A project MAY defer database observability when its database platform offers
no supported integration. The project MUST document the database owner, the
replacement observability capability, how bottlenecks will be detected, and
how API/database signals will be correlated.

An environment MAY use reduced sampling or different alert thresholds for local
or low-volume workloads, but database observability MUST remain enabled where
that environment is used to validate database behavior.

## Examples

### Good: configure observability as part of environment provisioning

```yaml
# Conceptual example. Use the configuration keys of the project's
# database observability integration.
databaseObservability:
  service: users-api
  environment: production
  database: users
  slowQueryAlert: enabled
```

The integration is provisioned with the environment and can be reviewed and
reproduced with the deployment configuration.

### Good: investigate a slow API request across both signals

```text
API access log:
service=users-api requestId=req-123 operation=UsersService.search durationMs=850

Database observation:
requestId=req-123 query=search_users durationMs=790 wait=lock
```

The correlated signals point the investigation toward database locking rather
than an unsupported assumption that the controller is slow.

### Bad: rely only on application timing

```ts
const startedAt = Date.now();
const users = await repository.search(filters);
logger.warn(`search took ${Date.now() - startedAt}ms`);
```

This may reveal a slow call but cannot identify database-wide contention,
blocking, pool saturation, or the specific database bottleneck that database
observability can expose.

### Bad: enable observability manually after an incident

```text
Production deployment: database observability not configured
Incident response: enable it manually and wait for the next occurrence
```

Observability must be part of the environment configuration so the necessary
signals exist when an incident occurs.

### Bad: expose database credentials in telemetry

```text
connectionString=postgres://user:password@db.example.com/users
```

Database credentials and connection strings must never be sent to logs or
telemetry fields.

## References

- [004-structured-access-logging.md](004-structured-access-logging.md)
- [Database transaction management](../database/002-transaction-management.md)
- [OpenTelemetry database semantic conventions](https://opentelemetry.io/docs/specs/semconv/database/)
