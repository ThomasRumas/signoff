# Rule: Manage Prisma Transactions Explicitly

## Status

Accepted

## Scope

This rule applies to TypeScript API applications that use Prisma with a
relational database. It complements
[001-prisma-orm.md](001-prisma-orm.md), which defines the ORM choice and
general Prisma usage.

This rule does not define controller boundaries, application architecture,
distributed transactions, or external payment orchestration.

## Context

Most database operations are independent and do not need an explicit
transaction wrapper. Adding a transaction to every operation creates
unnecessary complexity and can increase database contention.

Some workflows contain multiple database operations that represent one logical
change. Those operations must be committed together so that a failure cannot
leave partial data behind. Transactions provide this atomicity, but they do
not automatically solve every concurrency problem or coordinate external
systems.

## Decision

Use the simplest Prisma operation that correctly represents the required
database behavior:

- Use a normal Prisma method for one independent database operation.
- Use `prisma.$transaction()` when multiple database operations must all
  succeed or all fail.
- Keep the transaction short and limited to the database work that must be
  atomic.

## Rules

- An independent read or write SHOULD use the normal Prisma API without an
  explicit transaction wrapper.
- Multiple database operations that must succeed or fail together MUST run in
  the same Prisma transaction.
- Every database operation that participates in an interactive transaction
  MUST use the provided transaction client, conventionally named `tx`.
- Transactions MUST NOT contain HTTP calls, external API calls, email sending,
  file operations, or other slow external work unless a documented requirement
  justifies the design.
- Prisma MUST manage transaction commit and rollback. Application code MUST
  NOT manually issue `BEGIN`, `COMMIT`, or `ROLLBACK` for a Prisma transaction.
- A custom transaction manager or transaction propagation abstraction SHOULD
  NOT be introduced without a documented requirement that Prisma's transaction
  API cannot satisfy.
- Database constraints MUST enforce data invariants such as uniqueness,
  required values, foreign keys, and valid value ranges. Transactions MUST NOT
  be treated as a replacement for these constraints.
- Concurrency-sensitive workflows MUST use an appropriate mechanism, such as
  an atomic conditional update, a unique constraint, locking, an isolation
  level, or optimistic concurrency control. A transaction alone MUST NOT be
  assumed to make a workflow concurrency-safe.

## Rationale

This approach keeps routine Prisma usage simple while protecting workflows
that require atomicity. Using Prisma's transaction primitive directly makes the
transaction boundary visible to developers and coding assistants and avoids an
abstraction that has not yet solved a real problem.

Short transactions reduce lock duration and contention. Database constraints
and explicit concurrency controls address correctness concerns that atomicity
alone cannot address.

## Alternatives Considered

### An explicit transaction for every operation

This adds ceremony to independent reads and writes without improving their
required behavior. It is not the default.

### Manual transaction lifecycle management

Manually managing `BEGIN`, `COMMIT`, and `ROLLBACK` duplicates Prisma's
transaction handling and increases the risk of incomplete cleanup. Prisma's
transaction API is the default.

### A custom transaction abstraction

A transaction manager could become useful for a concrete cross-cutting
requirement, but introducing one prematurely hides the transaction boundary
and adds concepts developers and coding assistants must learn. It requires a
documented justification.

## Consequences

Developers can identify transaction requirements from the business operation
and keep simple database work readable. Multi-step writes receive consistent
commit and rollback behavior, while short transaction boundaries reduce
unnecessary database contention.

Teams must still reason about database constraints, isolation, retries,
deadlocks, and concurrent updates. External side effects require a separate
workflow and cannot be made atomic with a database transaction by this rule.

## Exceptions

A project MAY use a different transaction strategy when its database or
consistency model requires it. The exception MUST document the reason, the
transaction boundary, the failure behavior, and how concurrency and cleanup
are handled.

## Examples

### Independent operation

Use the normal Prisma API when the operation does not need to coordinate with
another database operation.

```ts
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: "John Doe" },
});
```

Wrapping this single operation in `$transaction()` would add complexity
without changing the required atomicity of the operation.

### Atomic multi-write operation

Use the transaction client for every database operation that belongs to the
same logical change.

```ts
const order = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: { customerId },
  });

  await tx.orderLine.createMany({
    data: items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
    })),
  });

  for (const item of items) {
    await tx.inventory.update({
      where: { productId: item.productId },
      data: { quantity: { decrement: item.quantity } },
    });
  }

  return order;
});
```

If any operation throws, Prisma rolls back the transaction. The order, order
lines, and inventory changes are therefore not partially committed.

### External side effects

Keep external work outside the database transaction and represent intermediate
state explicitly.

```ts
const order = await prisma.$transaction(async (tx) => {
  return tx.order.create({
    data: { customerId, status: "PENDING_PAYMENT" },
  });
});

const payment = await paymentProvider.chargeCustomer({
  orderId: order.id,
});

await prisma.order.update({
  where: { id: order.id },
  data: { status: payment.succeeded ? "PAID" : "PAYMENT_FAILED" },
});
```

The payment workflow needs its own retry and idempotency strategy. This rule
does not make the database update and external charge one atomic operation.

### Concurrency-safe conditional update

When success depends on a current value, make the condition part of the write
and check the affected-row count.

```ts
const result = await prisma.account.updateMany({
  where: {
    id: accountId,
    balance: { gte: amount },
  },
  data: {
    balance: { decrement: amount },
  },
});

if (result.count !== 1) {
  throw new Error("Insufficient funds or account not found");
}
```

The transaction decision depends on the complete workflow. Do not assume that
wrapping a read followed by a write in a default transaction prevents all
concurrent-update races.

## Reference

[Prisma transactions documentation](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
