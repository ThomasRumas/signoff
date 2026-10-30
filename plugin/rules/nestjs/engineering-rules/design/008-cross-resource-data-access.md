# Rule: Encapsulate Cross-Resource Data Access

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript APIs in which application or feature
services work with more than one business resource. It governs access to
resources owned by another service, including reads performed through Prisma,
repositories, or another persistence mechanism.

It does not prevent an application service from orchestrating several business
services when that orchestration represents a coherent use case. It defines how
each service must access the resource owned by another service.

## Context

Resources often have relationships that cross service boundaries. An order may
contain product identifiers, a shipment may refer to an order, and an invoice
may need customer information. The quickest implementation is often to inject
`PrismaService` and query the other resource's table directly.

That shortcut makes the consuming service aware of another resource's schema
and persistence details. It also bypasses the owning service's business rules,
authorization checks, filtering, caching, and data transformations. The result
is duplicated knowledge and a boundary that becomes increasingly difficult to
change.

The shortcut becomes especially expensive when several related resources are
needed. Calling a single-resource method once for every item can turn one
business operation into an N+1 query pattern.

## Decision

A NestJS service MUST NOT directly access the database tables or persistence
layer of a resource owned by another service. This includes Prisma models,
repositories, and other persistence mechanisms belonging to that resource.

When a service requires information belonging to another resource, it MUST use
the owning service's public application interface or an explicit client/port
for that capability. The owning service remains responsible for encapsulating
retrieval, authorization-aware selection, business rules, and transformation
of its resource.

When multiple instances of another resource are required, the consumer MUST
use an owning-service batch operation such as `findByIds(ids)` or
`findMany(criteria)`. It MUST NOT call a single-instance method once per item.
The batch operation SHOULD retrieve the required data in one efficient query
when the persistence technology and use case allow it.

## Rules

### Ownership and encapsulation

- Each service MUST directly access persistence only for the resources it owns.
- A consumer service MUST NOT inject `PrismaService`, another resource's
  repository, or another resource's data source merely to read that resource.
- Cross-resource access MUST go through the owning service's public application
  interface or through an explicit integration client/port when the owner is a
  separate process or system.
- The owning service MUST expose a method that represents the required business
  capability. It SHOULD return a typed business result rather than a Prisma
  model or other persistence entity.
- Consumers MUST NOT depend on the owning resource's table names, column
  layout, Prisma schema, joins, or persistence-specific filters.
- Authorization, visibility, soft-delete, tenant, and business rules owned by
  the resource MUST remain effective when the resource is accessed by another
  service.
- A consumer MAY compose results from several owning services when the
  composition belongs to its use case. The consumer MUST remain an
  orchestrator, not a second persistence owner.
- An asynchronous cross-resource service method SHOULD return one
  `Observable<T>` when it owns reactive composition or transformation.
- Promise-based repositories or clients MUST be adapted with `from()` before
  they participate in a reactive cross-resource flow.
- Dependent reads SHOULD use an operator such as `switchMap`; independent
  cross-resource reads SHOULD use `forkJoin` when all results are required.
- Controllers MUST return the composed service Observable without manually
  subscribing for a normal HTTP response.
- Cross-resource access MUST NOT add generic retry, timeout, fallback, or error
  transformation behavior. Resilience remains explicit and dependency-aware.

### Batch retrieval and N+1 prevention

- When a consumer needs several instances of a resource, the owning service
  MUST provide or expose an appropriate batch operation.
- A consumer MUST NOT call `findById`, `getById`, or an equivalent
  single-instance method inside a loop when the identifiers are known in
  advance.
- The consumer SHOULD collect identifiers, remove duplicates where appropriate,
  and make one batch call such as `findByIds(productIds)`.
- A batch method MUST define its behavior for an empty identifier list,
  duplicate identifiers, missing resources, ordering, authorization, and
  maximum input size when those concerns affect the use case.
- The owning service SHOULD implement a batch read with one database query or
  another bounded bulk operation. It MUST NOT hide an N+1 loop behind a method
  named `findByIds` or `findMany`.
- If one batch operation cannot meet the workload or data-source constraints,
  the alternative MUST be documented with its performance impact and
  mitigation.

### Contracts and evolution

- A cross-resource method MUST expose only the fields and semantics required by
  its consumer use case.
- A consumer MUST NOT spread raw persistence records into its own public API
  response. Response DTO and projection rules remain applicable after the
  cross-resource read.
- Changes to persistence schemas, caching, filtering, authorization, external
  data sources, and data transformations SHOULD remain local to the owning
  service when its public business contract is unchanged.
- Cross-resource service interactions MUST be covered by service tests that
  verify the owning method and its batch behavior where batching is required.
- Endpoints with material cross-resource workload MUST be measured against the
  applicable API performance targets. Query count, dependency latency, and
  failures SHOULD be observable when they can affect the endpoint budget.

## Rationale

The owning service is the natural place to keep knowledge about how a resource
is stored, retrieved, authorized, and transformed. Consumers depend on a
business capability instead of a persistence implementation, so the owner can
later introduce caching, additional rules, Redis, another data source, or a
different schema without changing every consumer.

Batch retrieval preserves that encapsulation without accepting the performance
cost of one query per item. For an order with `N` product references, the
expected shape is one order query plus one product batch query, rather than one
order query plus `N` product queries.

## Alternatives Considered

### Query the other resource directly with Prisma

This is simple in the short term, but it couples the consumer to another
resource's persistence model and bypasses the owner's rules. It also makes
schema, authorization, and caching changes harder to contain. It is forbidden
by this rule.

### Call the owning service once per item

This preserves the service boundary but creates an N+1 access pattern. It is
not acceptable when the consumer already knows that several instances are
needed and a batch operation can be exposed.

### Add a generic shared repository

A shared repository can conceal ownership rather than clarify it. It allows
multiple consumers to learn the same persistence details and makes business
rules difficult to centralize. A shared capability should be exposed through
an owning service or an explicit integration boundary instead.

### Join every resource in one query

A database join may be efficient for a genuinely owned projection, but it does
not automatically preserve service ownership. It is appropriate only when the
same persistence boundary owns the data and the query belongs to that owner's
use case. A consumer MUST NOT use a join to bypass another service's business
boundary.

## Consequences

Services have clear resource ownership and consumers remain independent of
persistence details. The owning service can apply consistent business rules,
authorization, transformations, and optimizations for every caller. Batch
methods also make query behavior explicit and reduce avoidable database load.

The owning service must maintain additional public methods and tests, and a
consumer may need to coordinate changes with that owner. The service graph can
also expose an unhealthy dependency cycle if boundaries are not designed
carefully; such a cycle MUST be resolved through a clearer capability owner or
an explicit integration port rather than by bypassing persistence boundaries.

## Exceptions

An application service MAY read multiple resources directly when the same
service explicitly owns the complete persistence boundary and the operation is
part of its own documented projection. This is not an exception for accessing
another service's private resource.

An operation that requires an atomic transaction across resource boundaries
MUST use an explicit application workflow and transaction design. It MUST NOT
be implemented by injecting another service's private repository into the
consumer. The ownership, consistency model, and failure behavior MUST be
documented.

For a separately deployed capability, the consumer MAY use a generated API
client, message contract, or integration port instead of an in-process NestJS
service. The same ownership, contract, authorization, and batch principles
still apply.

## Examples

### Good: use the owning service for a single resource

```ts
import { from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productService: ProductService,
  ) {}

  getOrder(id: string): Observable<OrderWithProducts> {
    return from(this.orderRepository.findById(id)).pipe(
      switchMap((order) => {
        const productIds = order.items.map((item) => item.productId);

        return this.productService.findByIds(productIds).pipe(
          map((products) => this.toOrderWithProducts(order, products)),
        );
      }),
    );
  }
}
```

`OrderService` owns order access. `ProductService` owns product access and
decides how products are retrieved and represented to this use case. The
order-to-product read is dependent, so `switchMap` keeps the composition in the
service's Observable flow.

### Bad: bypass the owning service

```ts
import { from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  getOrder(id: string): Observable<OrderWithProducts> {
    return from(this.prisma.order.findUnique({ where: { id } })).pipe(
      switchMap((order) =>
        from(
          this.prisma.product.findMany({
            where: { id: { in: order.items.map((item) => item.productId) } },
          }),
        ).pipe(map((products) => this.toOrderWithProducts(order, products))),
      ),
    );
  }
}
```

This service knows the `Product` persistence model and bypasses
`ProductService`. It is forbidden even if the query currently appears
efficient.

### Good: one batch operation

```ts
import { from, Observable, of } from "rxjs";

const productIds = order.items.map((item) => item.productId);
const products$: Observable<Product[]> =
  this.productService.findByIds(productIds);
```

```ts
@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  findByIds(ids: string[]): Observable<Product[]> {
    if (ids.length === 0) {
      return of([]);
    }

    return from(this.productRepository.findManyByIds(ids));
  }
}
```

The repository implementation should use one bounded bulk operation where
possible, for example a single `WHERE id IN (...)` query. The owning service
adapts the repository Promise at the reactive boundary and defines the empty
input behavior.

### Bad: N+1 calls through the owning service

```ts
import { from } from "rxjs";
import { concatMap, toArray } from "rxjs/operators";

from(order.items)
  .pipe(
    concatMap((item) =>
      this.productService.findById(item.productId),
    ),
    toArray(),
  );
```

This reactive loop still produces one product query per item. For three
products, the operation may result in one order query plus three product
queries instead of one order query plus one product batch query. The consumer
must call `findByIds` instead.

### Expected ownership flow

```text
OrderService
    | findByIds([productA, productB, productC])
    v
ProductService
    | one bounded batch operation
    v
Product persistence
```

The consumer knows the product capability it needs, not whether products are
stored in Prisma, Redis, or another data source.

## Related Guidance

- [API responsibility and business boundaries](../../architecture/002-api-responsibility-and-business-boundaries.md)
- [Use Prisma as the ORM](../database/001-prisma-orm.md)
- [Use typed DTO projections in reactive business services](003-response-dtos-and-reactive-projections.md)
- [Aggregate repeated frontend workflows in an API-owned route](006-backend-for-frontend-aggregation.md)
- Performance targets are project-specific; this skill does not currently
  define a shared performance rule set.
- [Reactive programming rules](../reactive-programmation/README.md)
- [Adapt Promise-based dependencies with `from()`](../reactive-programmation/003-promise-to-observable-conversion.md)
- [Preserve reactive boundaries in services and controllers](../reactive-programmation/004-service-and-controller-design.md)
- [Keep reactive composition separate from resilience policies](../reactive-programmation/005-composition-vs-resilience.md)