# Rule: Design Indexes from Query Patterns

## Status

Accepted

## Scope

This rule applies to API applications that use PostgreSQL, the default
relational database, regardless of language or ORM. It defines indexes for real access patterns. Examples use
Prisma syntax for the current TypeScript profile. Referential integrity is
defined in [004-data-integrity.md](004-data-integrity.md).

## Context

Indexes can make filtering, joining, lookup, and sorting much faster, but they
consume storage and make writes slower. An index on every column is not a
substitute for understanding how the application queries the database.

## Decision

Indexes MUST be designed from actual or explicitly required query patterns.
Composite indexes MUST match the predicates and ordering that matter to the
query, including the order of their columns.

## Rules

- A frequently used filter, lookup, join, or sort SHOULD have an index when
  query plans or expected scale justify it.
- Indexes SHOULD be added from observed or documented access patterns, not
  speculation.
- Composite indexes SHOULD begin with the columns used for equality or the
  most selective stable predicates, followed by additional filters and
  ordering as appropriate for the query.
- The column order of a composite index MUST be reviewed against the query
  predicates and sort order. A large composite index MUST NOT be added without
  a concrete query it supports.
- A unique constraint MAY also provide an index for its uniqueness lookup, but
  additional indexes MUST still be evaluated for other access patterns.
- A foreign key MUST NOT be assumed to have every useful index automatically.
  Add an index when the foreign-key column is frequently used to find related
  records or participates in a composite query.
- Index changes MUST be reviewed for write, storage, and migration cost.

## Rationale

Query-shaped indexes support the work the application actually performs while
keeping write overhead controlled. Explicitly separating constraints from
indexes prevents both missing performance support and unnecessary duplicate
indexes.

## Alternatives Considered

### Index every column

This increases storage and write cost and can create redundant indexes without
providing useful query plans. Indexes need a workload-based reason.

### Add one large composite index for all queries

Column order determines which predicates can use the index efficiently. A
large index that does not match a real query adds cost without solving the
problem.

### Treat foreign keys as performance indexes

A foreign key enforces validity, not speed. Query performance still requires an
index designed for the access pattern.

## Consequences

Common reads can become faster and more predictable. Each index adds migration,
storage, and write-maintenance cost, so index changes should be measured or
justified and revisited as workloads change.

## Exceptions

A project MAY add an index for a documented future-critical migration or
operational query. The exception MUST identify the query and explain why the
cost is acceptable before the workload is observed.

## Examples

The following query and schema snippets use Prisma syntax; the index decisions
are based on PostgreSQL query patterns.

### Good: index matches the query

```ts
const orders = await prisma.order.findMany({
  where: {
    userId,
    status: "PAID",
  },
  orderBy: { createdAt: "desc" },
});
```

```prisma
model Order {
  id        String      @id @default(uuid())
  userId    String
  status    OrderStatus
  createdAt DateTime    @default(now())

  @@index([userId, status, createdAt])
}
```

The index is tied to a real filter and ordering pattern. The exact design
should still be confirmed with PostgreSQL query plans at the expected scale.

### Bad: speculative indexes everywhere

```prisma
model Order {
  id        String      @id @default(uuid())
  userId    String
  status    OrderStatus
  createdAt DateTime    @default(now())
  total     Decimal

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([total])
}
```

These indexes have no stated access patterns and may add write cost without
improving the application's queries. Add only the indexes supported by real
workloads.

### Bad: composite index unrelated to the query

```prisma
model Order {
  userId    String
  status    OrderStatus
  createdAt DateTime

  @@index([createdAt, status, userId])
}
```

For a query that filters by `userId` and `status`, then orders by
`createdAt`, this order may not support the leading predicates effectively.
Review the query shape before choosing the column order.

## References

- [003-relational-modeling.md](003-relational-modeling.md)
- [004-data-integrity.md](004-data-integrity.md)
