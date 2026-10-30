# Rule: Evolve Schemas Through Safe Prisma Migrations

## Status

Accepted

## Scope

This rule applies to TypeScript API applications that use PostgreSQL with
Prisma. It defines how relational schema changes are versioned, reviewed, and
deployed. Prisma's general ORM choice is defined in
[001-prisma-orm.md](001-prisma-orm.md).

## Context

The Prisma schema is part of the application's contract, not only
documentation. Manual production changes can diverge from migration history,
while destructive changes can invalidate data or break older application
instances during a rolling deployment.

## Decision

All schema changes MUST be represented by reviewed, version-controlled Prisma
migrations. Potentially destructive changes MUST be staged so compatible
application versions can coexist and existing data can be preserved or
intentionally retired.

## Rules

- A schema change MUST include the corresponding Prisma migration and any
  required application changes.
- Migration files MUST be reviewed, committed, and applied through the
  project's controlled deployment process.
- Production tables MUST NOT be manually changed in a way that is absent from
  migration history.
- A migration MUST account for existing rows before adding a required column,
  changing a type, or tightening a constraint.
- Destructive changes such as dropping a table or column, making a nullable
  column required, or changing a data type MUST use a staged rollout when
  compatibility or data preservation is a concern.
- A staged change SHOULD add the replacement structure, deploy compatible
  reads and writes, backfill existing data, switch consumers, and remove the
  old structure only after it is no longer used.
- Migration execution MUST be tested against representative existing data and
  MUST include a rollback or recovery plan appropriate to the change.
- Schema changes MUST preserve the relational constraints and data ownership
  decisions in [003-relational-modeling.md](003-relational-modeling.md) and
  [004-data-integrity.md](004-data-integrity.md).

## Rationale

Version-controlled migrations make changes reproducible across environments
and reviewable alongside application code. Staged changes reduce deployment
risk when multiple application versions run at the same time and give teams a
controlled opportunity to backfill or verify data.

## Alternatives Considered

### Change production tables manually

Manual changes may solve an immediate incident but create drift and make new
environments impossible to reproduce reliably. Emergency changes still need
to be captured in migration history afterward.

### Drop or rename a heavily used column immediately

Older application instances may still read or write the column, and existing
data may be lost. A staged compatibility rollout is the default for risky
changes.

### Rely on application startup to alter the schema

Implicit startup changes hide schema evolution from review and can race across
instances. Explicit Prisma migrations are the source of truth.

## Consequences

Database changes become visible in code review and can be applied consistently
across environments. Safe staged migrations require temporary compatibility
code, backfill planning, and sometimes more than one deployment.

## Exceptions

A project MAY use an emergency database procedure or a different migration
mechanism when required by an operational incident or database capability. The
change MUST be documented, reconciled with migration history, and followed by a
review of its data and compatibility impact.

## Examples

### Good: staged removal of a column

For a heavily used `displayName` column:

1. Add the replacement column or structure in a Prisma migration.
2. Deploy code that can read both representations and writes both values.
3. Backfill existing rows and verify the result.
4. Switch reads to the replacement representation.
5. Stop writing the old column.
6. Remove the old column in a later migration after all old application
   instances are gone.

This sequence keeps rolling deployments compatible and makes data loss an
explicit, reviewable decision.

### Bad: immediate destructive production change

```sql
ALTER TABLE "User" DROP COLUMN "displayName";
```

Running this manually while deployed code still expects `displayName` can break
requests and permanently remove data outside the migration history.

### Good: add a required field safely

Add the field as nullable or with a safe temporary default, deploy code that
writes it, backfill existing rows, verify that no rows are invalid, then add
the `NOT NULL` constraint in a later migration if the domain requires it.

### Bad: make an existing nullable field required without a data plan

```prisma
model User {
  name String
}
```

Changing `name String?` to `name String` fails or forces an unexamined value for
existing rows. The migration must first define how missing values are handled.

## References

- [001-prisma-orm.md](001-prisma-orm.md)
- [003-relational-modeling.md](003-relational-modeling.md)
- [004-data-integrity.md](004-data-integrity.md)
