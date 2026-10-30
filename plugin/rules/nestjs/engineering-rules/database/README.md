# Database Engineering Rules

This family separates PostgreSQL schema guidance, which is reusable across
languages, from Prisma implementation choices for the current TypeScript
profile. The PostgreSQL rules use Prisma examples where useful; those examples
do not make Prisma a requirement.

## PostgreSQL Schema Rules

PostgreSQL is the default relational database for NestJS APIs; another
database requires a documented exception. These rules apply to PostgreSQL
schemas regardless of language or ORM.

1. [003-relational-modeling.md](003-relational-modeling.md) defines stable
   identifiers, relationships, normalization, snapshots, and JSON boundaries.
2. [004-data-integrity.md](004-data-integrity.md) defines foreign keys,
   nullability, uniqueness, controlled values, and deletion behavior.
3. [005-data-types-and-timestamps.md](005-data-types-and-timestamps.md)
   defines PostgreSQL types, money precision, timestamps, and soft deletion.
4. [006-indexes.md](006-indexes.md) defines query-driven and composite index
   design.

## TypeScript / Prisma Implementation Rules

These rules describe the selected ORM and migration workflow for the current
TypeScript profile. They are not PostgreSQL-wide or API-wide requirements.

1. [001-prisma-orm.md](001-prisma-orm.md) defines Prisma as the selected ORM
   and the boundary for raw SQL.
2. [002-transaction-management.md](002-transaction-management.md) defines
   when and how to use Prisma transactions.
3. [007-schema-migrations.md](007-schema-migrations.md) defines the Prisma
   migration workflow for schema evolution.

## Schema Review Checklist

Before adding or changing a table, verify:

- [ ] The table represents a real entity, relationship, or historical record.
- [ ] It has a stable primary key and separates internal IDs from business
      identifiers.
- [ ] Relationships and many-to-many join tables are modeled explicitly.
- [ ] Foreign keys enforce required relationships in the database.
- [ ] Required fields are non-null and every nullable field has a defined
      meaning.
- [ ] Unique and compound-unique requirements are database constraints.
- [ ] The deletion behavior is explicit and appropriate for the business data.
- [ ] PostgreSQL types are appropriate, including `numeric` with explicit
   precision and scale for money.
- [ ] Timestamp names are consistent and soft deletion is justified.
- [ ] JSON is used only for genuinely flexible data.
- [ ] Indexes support actual filtering, joining, sorting, or lookup patterns.
- [ ] Composite index column order matches the query pattern.
- [ ] The schema change has a reviewed migration using the project's selected
   migration tool.
- [ ] Existing data, rolling deployment compatibility, and destructive-change
      recovery have been considered.

The detailed rationale and good/bad patterns are maintained in the linked rule
rather than duplicated in this checklist.
