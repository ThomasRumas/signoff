# Pagination Rules

These Accepted rules define a reusable pagination contract and its current
NestJS/TypeScript implementation for collection endpoints. The contract may be
used by another stack; implementation details must be adapted to that stack.

## Rules

1. [001-standard-pagination.md](001-standard-pagination.md) defines the
   portable response contract and the current shared implementation,
   database-level pagination, OpenAPI requirements, and documented exceptions.

## How to Use These Rules

Use the shared pagination module for every collection service and endpoint.
Resource services provide their own query, filters, ordering, and DTO mapping;
they do not copy pagination types or mechanics.