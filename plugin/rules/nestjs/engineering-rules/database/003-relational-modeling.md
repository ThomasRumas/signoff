# Rule: Design Relational Models Explicitly

## Status

Accepted

## Scope

This rule applies to API applications that use PostgreSQL, the default
relational database, regardless of language or ORM. It defines relational modeling decisions. Examples use Prisma
to illustrate the current TypeScript profile. Database integrity, types,
indexes, and migrations are defined in the related rules in this folder.

## Context

An ORM provides an application-level mapping to the database, but it does not
replace relational design. A model that is easy to write in application code
can still be difficult to query, inconsistent, or impossible to evolve safely
if its relationships and data ownership are unclear.

The schema should therefore be designed as a relational database schema first,
then represented in Prisma.

## Decision

We MUST favor simple, explicit relational models with stable internal
identifiers, clear relationship cardinality, and one authoritative location
for current data. Duplication, flexible JSON, and additional tables require a
concrete domain or operational reason.

## Rules

- Every entity table MUST have a stable, unique, non-null primary key that is
  never changed during the record's lifetime.
- Internal database identity SHOULD use a generated ID. Mutable business data
  such as email, username, phone number, or an external account number MUST
  NOT be used as the internal primary key without a documented reason.
- Business identifiers MUST be modeled separately and constrained as required.
  For example, an invoice number is not the same concept as the invoice's
  database ID.
- Relationship cardinality MUST be represented explicitly. A many-to-many
  relationship MUST use an explicit join table with a composite primary key or
  another database-enforced uniqueness constraint.
- The relationship table MUST contain relationship attributes when the
  relationship has its own data, such as assignment time or assigning user.
- Data SHOULD be normalized by default. A current value SHOULD have one
  authoritative location.
- Denormalization MAY be used for a demonstrated performance, reporting,
  audit, or historical-snapshot requirement. The reason and update strategy
  MUST be documented.
- Historical copies MUST be treated as snapshots, not as a second current
  source of truth.
- Relational data that is frequently filtered, joined, sorted, constrained, or
  aggregated MUST be represented by proper columns and relationships rather
  than hidden in JSON.
- JSON MAY be used for genuinely flexible data such as external payloads,
  dynamic metadata, or configuration.

## Rationale

Stable IDs protect relationships when business values change. Explicit
cardinality makes queries and constraints predictable. Normalization prevents
current data from drifting between tables, while deliberate snapshots preserve
facts that are supposed to remain true about a past event.

Keeping flexible data in JSON only when its structure is genuinely flexible
also preserves database queryability and integrity.

## Alternatives Considered

### Use business data as the primary key

This makes relationships depend on values that may change and couples internal
storage to external business rules. A separate stable ID is the default.

### Store every concept in its own table

Excessive normalization increases joins and complexity without improving the
domain model. New tables should represent real entities, relationships, or
historical records.

### Duplicate current data for future performance

Premature denormalization creates synchronization work without a demonstrated
access-pattern requirement. Start normalized and add a documented optimization
when needed.

## Consequences

The database remains understandable and supports predictable queries. Some
reads require joins, and deliberate denormalization requires backfills,
maintenance, and tests to keep the duplicate or snapshot semantics clear.

## Exceptions

A project MAY use a different model when a documented domain, reporting,
performance, audit, or integration requirement justifies it. The exception
MUST identify data ownership and how consistency is maintained.

## Examples

The following schema snippets use Prisma syntax for the current TypeScript
profile. They illustrate PostgreSQL modeling decisions, not an ORM requirement.

### Good: stable ID and separate business identifier

```prisma
model Invoice {
  id            String   @id @default(uuid())
  invoiceNumber String   @unique
  createdAt     DateTime @default(now())
}
```

`id` remains stable if the invoice-numbering policy changes. The business
identifier can still be unique without becoming the record's identity.

### Bad: mutable business data as identity

```prisma
model User {
  email String @id
  name  String
}
```

Changing an email now requires changing every dependent relationship and risks
breaking references.

### Good: explicit many-to-many relationship

```prisma
model User {
  id    String     @id @default(uuid())
  roles UserRole[]
}

model Role {
  id    String     @id @default(uuid())
  users UserRole[]
}

model UserRole {
  userId     String
  roleId     String
  assignedAt DateTime @default(now())
  assignedBy String

  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])

  @@id([userId, roleId])
}
```

The join table models the relationship and its attributes. Foreign-key and
delete behavior are defined by [004-data-integrity.md](004-data-integrity.md).

### Bad: duplicated current values

```prisma
model Order {
  id           String @id @default(uuid())
  customerId   String
  customerName String
  customerEmail String
}
```

This can leave the order with stale current customer data. Use `customerId`
and read current customer fields from the authoritative customer record.

### Good: intentional historical snapshot

```prisma
model Invoice {
  id             String @id @default(uuid())
  customerId     String
  billingName    String
  billingAddress String
  issuedAt       DateTime
}
```

`billingName` and `billingAddress` preserve what was printed on the invoice at
issue time. They are historical facts, not replacements for the customer's
current profile.

### Good and bad JSON boundaries

```prisma
model IntegrationEvent {
  id         String   @id @default(uuid())
  provider   String
  payload    Json
  receivedAt DateTime @default(now())
}
```

An external payload may legitimately be flexible. Conversely, fields such as
`customerId`, `status`, and `total` should be modeled as columns when they are
used for relationships, filtering, or aggregation rather than stored inside a
`metadata Json` object.

## References

- [004-data-integrity.md](004-data-integrity.md)
- [005-data-types-and-timestamps.md](005-data-types-and-timestamps.md)
- [006-indexes.md](006-indexes.md)
- [007-schema-migrations.md](007-schema-migrations.md)
