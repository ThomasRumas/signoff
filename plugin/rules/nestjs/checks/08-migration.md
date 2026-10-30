---
title: Schema migration.
globs: ["**/migrations/**/*.sql"]
sources:
  - engineering-rules/database/007-schema-migrations.md
  - engineering-rules/database/README.md
---
- Every schema change ships as a reviewed, version-controlled migration; no manual production drift.
- Required columns, type changes, and destructive changes MUST account for existing data and for old and new application versions running at the same time. Stage them (add, backfill, then enforce or drop) instead of one breaking step.
- Flag data loss without an explicit recovery or rollback plan.
- Apply the PostgreSQL schema rules: foreign keys, uniqueness, intentional nullability, exact numeric money, consistent timestamps, and query-justified indexes.
