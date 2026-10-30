# Rule: Enforce Relational Integrity in the Database

## Status

Accepted

## Scope

This rule applies to API applications that use PostgreSQL, the default
relational database, regardless of language or ORM. It defines constraints, nullability, controlled values, and
deletion behavior. Examples use Prisma syntax for the current TypeScript
profile. Query-performance indexes are defined in
[006-indexes.md](006-indexes.md).

## Context

Application checks run before a write and can race with another request. The
database is the final authority for relationships, required values, and
uniqueness. Constraints also protect data when more than one application,
worker, migration, or administrative tool writes to the database.

## Decision

We MUST express data invariants in PostgreSQL constraints and MUST choose
nullability and deletion behavior intentionally. Application validation remains
useful for user-facing errors, but it MUST NOT be the only protection for a
database invariant.

## Rules

- Foreign-key relationships MUST be represented explicitly and enforced by the
  database.
- Columns MUST be `NOT NULL` by default. A nullable column MUST represent a
  meaningful state that is distinct from an empty string, zero, or false.
- Every value that must be unique MUST have a database-level unique constraint.
  Compound uniqueness MUST use a compound constraint.
- Controlled, small, and stable value sets SHOULD use a PostgreSQL enum or
  constraint. Values that change frequently or are managed dynamically SHOULD
  use a reference table.
- Delete behavior MUST be explicitly selected for every important relationship.
  The choice MUST reflect the business relationship, not only technical
  convenience.
- `Cascade` SHOULD be limited to genuinely dependent records, such as order
  lines owned by an order.
- Business or historical records SHOULD use `Restrict`, `NoAction`, or a
  deliberate soft-delete strategy instead of casually cascading from a parent.
- `SetNull` MAY be used only when the relationship is optional and the loss of
  the reference has a meaningful interpretation.
- A foreign key and an index solve different problems. A foreign key MUST NOT
  be treated as a substitute for a query index.

## Rationale

Database constraints make correctness consistent across all writers and close
race conditions that application-only checks cannot close. Intentional NULL and
delete semantics make the stored state interpretable instead of forcing every
consumer to guess what missing data means.

## Alternatives Considered

### Validate relationships only in application code

A check such as `userExists` can become stale before the write commits. The
foreign key remains necessary even when application validation provides a
friendlier error message.

### Make every field nullable

This avoids an immediate decision but creates ambiguous states and pushes
invariant handling into every query. Nullable fields require a domain meaning.

### Cascade all deletes

This is convenient but can erase valuable business history through one parent
delete. Cascade is appropriate only for data that has no independent meaning.

## Consequences

Invalid references, duplicate unique values, and unintended missing values are
rejected close to the source. Writes may need to handle constraint errors, and
delete operations require an explicit business decision.

## Exceptions

A project MAY omit or alter a constraint only when the database limitation or
domain requirement is documented, including how integrity is protected by the
alternative design.

## Examples

The following schema snippets use Prisma syntax for the current TypeScript
profile; the rules apply to the PostgreSQL constraints they represent.

### Good: database-enforced relationship

```prisma
model Order {
  id       String @id @default(uuid())
  customerId String

  customer Customer @relation(
    fields: [customerId],
    references: [id],
    onDelete: Restrict
  )
}
```

The database rejects an order that refers to a missing customer and prevents a
customer delete that would erase orders.

### Bad: application-only relationship validation

```ts
const customer = await prisma.customer.findUnique({
  where: { id: customerId },
});

if (customer) {
  await prisma.order.create({ data: { customerId } });
}
```

Another request can delete the customer or otherwise change the state between
the check and the write. The schema still needs a foreign key.

### Good: intentional nullability

```prisma
model User {
  id        String    @id @default(uuid())
  email     String
  name      String
  deletedAt DateTime?
}
```

`deletedAt = NULL` means the user is not soft-deleted. Required identity fields
remain non-null.

### Bad: nullable-everything model

```prisma
model User {
  id    String  @id
  email String?
  name  String?
}
```

This makes unknown, omitted, and empty values indistinguishable without a real
domain reason.

### Good: database-level uniqueness

```prisma
model Membership {
  id       String @id @default(uuid())
  userId   String
  tenantId String

  @@unique([userId, tenantId])
}
```

The database prevents concurrent requests from creating two memberships for
the same user and tenant.

### Bad: race-prone uniqueness check

```ts
if (!(await membershipExists(userId, tenantId))) {
  await createMembership(userId, tenantId);
}
```

Two requests can both observe no membership. The application should handle a
unique-constraint error after the database enforces the rule.

### Good and bad deletion behavior

```prisma
model OrderLine {
  id      String @id @default(uuid())
  orderId String

  order Order @relation(
    fields: [orderId],
    references: [id],
    onDelete: Cascade
  )
}
```

Cascading from an order to dependent order lines can be appropriate. Cascading
from a customer to orders is usually unsafe because orders are historical or
business records and should remain available.

## References

- [003-relational-modeling.md](003-relational-modeling.md)
- [006-indexes.md](006-indexes.md)
