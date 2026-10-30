---
title: PostgreSQL schema.
globs: ["**/*.prisma"]
sources:
  - engineering-rules/database/003-relational-modeling.md
  - engineering-rules/database/004-data-integrity.md
  - engineering-rules/database/005-data-types-and-timestamps.md
  - engineering-rules/database/006-indexes.md
---
- Primary keys are stable, non-null IDs separate from mutable business identifiers.
- Relationships declare explicit cardinality, use join tables for many-to-many, and are enforced with database foreign keys. Delete behavior is intentional; flag casual cascading deletes.
- Uniqueness and required values are enforced in the database, not only in application code. Flag nullable-by-default columns.
- Money uses exact `numeric`/`Decimal`, never floating point. Timestamps are consistent and timezone-aware. Soft deletion requires a justification.
- JSON columns only for genuinely flexible data, never for relational or filterable data. Do not duplicate current truth.
- Indexes MUST match actual filters, joins, lookups, or ordering with a deliberate composite column order. Flag speculative indexes; a foreign key is not a query index.
