# Rule: Choose Domain Types and Timestamp Conventions

## Status

Accepted

## Scope

This rule applies to API applications that use PostgreSQL, the default
relational database, regardless of language or ORM. It defines column types, monetary precision, timestamp names,
and soft-deletion fields. Examples use Prisma syntax for the current
TypeScript profile. General NULL semantics are defined in
[004-data-integrity.md](004-data-integrity.md).

## Context

Using strings for every value weakens the database contract. Using floating
point for money introduces precision errors, and inconsistent timestamp names
make common queries and operational work harder. A schema should represent the
meaning of its data directly.

## Decision

We MUST choose database types that represent the domain and MUST use consistent
timestamp conventions. Monetary values MUST use an exact decimal type with an
appropriate precision and scale.

## Rules

- PostgreSQL `integer` SHOULD be used for ordinary integers and `bigint` for
  values that exceed the ordinary integer range. Use `boolean` for true/false
  values and an appropriate timestamp type for temporal values.
- Monetary and other exact decimal values MUST use `numeric` with precision
  and scale selected for the domain. Floating-point types MUST NOT be used for
  money.
- Fields that represent a small, stable controlled set SHOULD use a PostgreSQL
  enum or constraint as described in [004-data-integrity.md](004-data-integrity.md).
- `jsonb` MAY be used for genuinely flexible structures, but relational values
  SHOULD remain typed columns.
- Persistent entities that need creation or update history SHOULD use
  consistent creation and update timestamp columns.
- Timestamp fields MUST use the project's documented names for creation,
  update, and deletion times
  when those concepts exist.
- `deletedAt DateTime?` SHOULD be added only when the business requires soft
  deletion. It MUST NOT be added automatically to every table.

## Rationale

Domain types let PostgreSQL reject invalid data and let queries express their
intent. Exact money representation prevents rounding surprises. Consistent
timestamps improve sorting, synchronization, audits, debugging, and support
investigations without requiring project-specific naming knowledge.

## Alternatives Considered

### Store all values as strings

Strings are flexible but discard useful constraints and force every consumer to
parse and validate values. They are not the default for typed domain data.

### Use floating point for monetary values

Floating point is efficient for approximate scientific calculations but cannot
represent many decimal fractions exactly. `Decimal` is required for money.

### Add soft deletion to every table

Soft deletion changes query semantics and retention behavior. It should exist
only where restoring or retaining deleted records is a business requirement.

## Consequences

Schemas become more precise and queries need less defensive conversion. Teams
must choose suitable decimal precision and scale and must account for soft-
deleted records in queries where that behavior is enabled.

## Exceptions

A project MAY use a different type when a documented PostgreSQL or integration
requirement demands it. The exception MUST explain the precision, range, and
conversion behavior.

## Examples

The following schema snippets use Prisma syntax for the current TypeScript
profile; the rules apply to the PostgreSQL types and data semantics they
represent.

### Good: domain types and precise money

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(12, 2)
  quantity    Int
  isActive    Boolean
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Bad: stringly typed data and floating-point money

```prisma
model Product {
  id       String @id
  price    Float
  quantity String
  isActive String
  created  DateTime
  updated  DateTime
}
```

This allows invalid boolean and quantity values, risks monetary precision
errors, and introduces inconsistent timestamp names.

### Good: justified soft deletion

```prisma
model Account {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}
```

This is appropriate when the account must be retained or restorable. A purely
transient record should usually be physically deleted instead of receiving a
soft-delete field by default.

## References

- [003-relational-modeling.md](003-relational-modeling.md)
- [004-data-integrity.md](004-data-integrity.md)
