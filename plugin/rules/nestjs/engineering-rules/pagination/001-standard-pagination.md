# Rule: Use One Reusable Pagination Contract and Implementation

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript APIs that expose collection resources
through services and HTTP endpoints. It defines the default pagination contract,
the shared implementation boundary, database behavior, and OpenAPI
documentation requirements.

It applies to `getAll`, `findAll`, `list`, and any equivalent operation that
returns a collection. It also applies when a collection is filtered, sorted, or
returned as a response view.

## Context

An unbounded collection method works while a table is small. As the dataset
grows, the same method can load too many rows, consume excessive memory, slow
down the database, and return an unstable API payload. If each team or service
designs pagination independently, clients also have to learn different query
parameters, response shapes, defaults, and edge-case behavior.

Pagination is therefore both a performance boundary and an API convention. The
convention must be reusable, and its mechanics must have one owner. Services
should not each implement their own interpretation of page numbers, maximum
page sizes, offsets, total counts, or response metadata.

## Decision

Every collection service method and endpoint MUST be paginated by default. No
standard collection method MUST expose an unbounded result.

Pagination MUST be implemented once in a shared API pagination module or
package. That shared implementation MUST own:

- pagination input normalization and validation;
- default and maximum page-size policy;
- 1-based page handling and offset calculation;
- the generic paginated response and metadata contract;
- total-page calculation and empty-result behavior; and
- the reusable OpenAPI pagination response decorator, when Swagger is used.

Every resource service MUST reuse this shared contract and implementation. A
resource service provides the resource-specific query, filters, ordering, and
DTO mapping; it MUST NOT copy the pagination algorithm or redefine the shared
pagination DTOs. Reuse does not require service class inheritance: services
depend on the shared pagination abstraction and supply their own data access
functions.

The standard implementation uses offset pagination with a default page of `1`,
a default page size of `30`, and a maximum page size of `100`. A stricter
maximum MAY be defined for a specific endpoint when its workload requires it.
Any deviation MUST be documented in the endpoint contract and performance
decision.

## Rules

### Shared contract and ownership

- The pagination contract MUST be defined in one shared module or package.
- Pagination query and response types MUST NOT be reimplemented independently
  in each resource service.
- Pagination normalization, bounds checking, offset calculation, total-page
  calculation, and response assembly MUST have one shared implementation.
- Resource services MUST reuse the shared implementation and provide only their
  resource-specific data access and DTO projection.
- The shared pagination implementation MUST NOT depend on a specific Prisma
  model or resource DTO.
- A service MUST NOT expose an unbounded `getAll`, `findAll`, `list`, or
  equivalent collection method.
- An exception for an inherently bounded collection MUST be explicit, justified,
  and backed by a strict documented upper bound.

### Request and response contract

- The standard query parameters MUST be `page` and `pageSize`.
- Page numbering MUST be 1-based. `page=1` is the first page.
- `page` MUST default to `1` and MUST be an integer greater than or equal to
  `1`.
- `pageSize` MUST default to `30` and MUST be an integer greater than or equal
  to `1`.
- `pageSize` MUST NOT exceed the shared maximum of `100`, unless a documented
  endpoint-specific maximum is lower.
- Invalid pagination values MUST be rejected through the API's standard client
  error contract. They MUST NOT be silently converted into an unbounded query.
- Every paginated response MUST contain `data` and `pagination` fields.
- `data` MUST contain the resource-specific response DTO, never a Prisma model
  or another persistence entity.
- `pagination.page` MUST contain the normalized current page.
- `pagination.pageSize` MUST contain the normalized page size.
- `pagination.totalItems` MUST describe the complete filtered result set, not
  only the current page.
- `pagination.totalPages` MUST be calculated as
  `Math.ceil(totalItems / pageSize)`, with `0` for an empty result set.

The standard response shape is:

```ts
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

For example, a product collection returns `PaginatedResponse<ProductDto>`:

```json
{
  "data": [
    {
      "id": "product-1",
      "name": "Product 1"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "totalItems": 127,
    "totalPages": 5
  }
}
```

### Shared input validation

The shared query DTO MUST validate and transform query-string values before
they reach a service. The exact location may vary by project, but the rules
and defaults MUST remain shared.

```ts
export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 30,
    default: 30,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 30;
}
```

The application MUST use the appropriate NestJS `ValidationPipe` configuration
so that query parameters are transformed into validated numbers. A project
with a different validation mechanism MUST preserve the same observable
contract.

### Single shared implementation

The shared module SHOULD expose a generic helper or service that receives the
resource-specific page query, data retrieval, and count operations. It MUST
perform the common pagination mechanics once.

```ts
type PaginationQuery = {
  page: number;
  pageSize: number;
};

type PaginateOptions<T> = PaginationQuery & {
  findMany: (skip: number, take: number) => Observable<T[]>;
  count: () => Observable<number>;
};

export function paginate<T>({
  page,
  pageSize,
  findMany,
  count,
}: PaginateOptions<T>): Observable<PaginatedResponse<T>> {
  const skip = (page - 1) * pageSize;

  return defer(() =>
    forkJoin({
      items: findMany(skip, pageSize),
      totalItems: count(),
    }),
  ).pipe(
    map(({ items, totalItems }) => ({
      data: items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    })),
  );
}
```

This example illustrates the ownership boundary. The production shared helper
MUST also enforce the shared bounds and the project's error behavior before
executing the callbacks. Services MUST call this helper rather than copying
`skip`, `take`, `count`, or `totalPages` logic.

The example assumes the shared module imports `Observable`, `defer`, and
`forkJoin` from `rxjs`, and `map` from `rxjs/operators` (or the project's
equivalent RxJS import convention).

### Reactive service and controller boundaries

- A collection service that performs asynchronous pagination SHOULD return
  `Observable<PaginatedResponse<T>>`.
- Promise-based database operations MUST be adapted with `from()` before they
  participate in the shared reactive pagination flow.
- The shared paginator MUST compose the page query and count query with RxJS;
  independent operations SHOULD use `forkJoin` so they run concurrently.
- Pagination MUST NOT introduce generic retry, timeout, fallback, or error
  transformation behavior. Resilience remains explicit and dependency-aware.
- A controller SHOULD return the service Observable directly and MUST NOT
  manually subscribe merely to produce the HTTP response.
- Isolated non-composed operations MAY remain Promise-based when leaving the
  reactive boundary is intentional and documented.

### Service and repository behavior

- Every collection service method MUST accept the shared pagination input, or a
  query object that contains that same validated contract.
- Resource filters MUST be built once and applied identically to both the data
  query and the count query.
- Resource sorting MUST be explicit and stable. The ordering used to retrieve
  pages MUST include a deterministic tie-breaker when duplicate sort values are
  possible.
- Pagination MUST happen at the database or data-source level. Services MUST
  NOT load the complete collection and slice it in application memory.
- The data query MUST apply the calculated `skip` and `take`, or equivalent
  operations for another data source.
- The count query MUST count the same filtered dataset as the data query.
- The data query and count query SHOULD run concurrently when the data source
  supports it, using `forkJoin` within the reactive service flow.
- Services MUST map retrieved records to their resource DTO before returning
  the paginated response Observable.
- Empty results MUST return `data: []`, `totalItems: 0`, and `totalPages: 0`.
- Requests beyond the last page SHOULD return `data: []` with accurate metadata,
  unless the resource contract explicitly defines another behavior.

Example service usage:

```ts
async getAll(
  pagination: PaginationQueryDto,
  filters: ProductFilters,
): Observable<PaginatedResponse<ProductDto>> {
  const where = this.productQuery.toWhere(filters);

  return paginate({
    page: pagination.page,
    pageSize: pagination.pageSize,
    findMany: (skip, take) =>
      from(
        this.prisma.product.findMany({
          where,
          orderBy: [{ name: "asc" }, { id: "asc" }],
          skip,
          take,
        }),
      ).pipe(
        map((products) => products.map((product) => this.toDto(product))),
      ),
    count: () => from(this.prisma.product.count({ where })),
  });
}
```

The service supplies the product query and DTO mapping, adapts its Prisma
Promises with `from()`, and returns the shared Observable. It does not own a
second pagination algorithm or manually subscribe to the result.

### OpenAPI and Swagger

- Every paginated endpoint MUST document `page`, `pageSize`, their defaults,
  valid ranges, and the endpoint's maximum page size.
- OpenAPI MUST expose the concrete resource DTO inside the generic `data`
  array. It MUST NOT describe `data` as an untyped array or as a persistence
  entity.
- The pagination metadata schema MUST be shared rather than copied into every
  response definition.
- The paginated response decorator MUST be implemented once in the shared
  pagination module and reused for every resource DTO.

Conceptually, the controller uses the shared decorator and service contract:

```ts
@ApiPaginatedResponse(ProductDto)
@Get()
async getAll(
  @Query() pagination: PaginationQueryDto,
): Observable<PaginatedResponse<ProductDto>> {
  return this.productService.getAll(pagination);
}
```

The documented result is `PaginatedResponse<ProductDto>`, not a generic array
and not a Prisma type.

### Performance and database protection

- An endpoint MUST NOT retrieve the full collection solely to paginate it in
  memory.
- The shared maximum page size MUST protect the database and response payload
  from excessive requests.
- Query count, response size, latency, and database behavior SHOULD be measured
  for high-volume or materially expensive collection endpoints.
- Database indexes SHOULD support the filters and stable ordering used by
  paginated queries. Pagination does not remove the need for query-driven index
  design.
- High offset costs MUST be considered for very large datasets. Cursor
  pagination MAY be introduced as a specialized contract when offset pagination
  no longer meets the endpoint's performance target.
- A cursor-based exception MUST document its cursor contract, ordering,
  consistency behavior, OpenAPI representation, and why the standard offset
  contract is insufficient.

## Rationale

One shared contract gives every consumer the same page numbering, defaults,
metadata, error behavior, and OpenAPI shape. One shared implementation keeps
the calculation and edge-case behavior consistent and prevents local
variations from becoming platform-wide incompatibilities.

Keeping resource queries and DTO mapping in the resource service preserves
ownership without duplicating pagination mechanics. Database-level pagination
limits the data retrieved, while applying the same filters to the count keeps
the metadata meaningful.

## Alternatives Considered

### Let every service implement pagination independently

This creates inconsistent contracts and repeated logic. Fixes to defaults,
bounds, edge cases, or OpenAPI behavior must then be applied in many places. It
is rejected.

### Fetch the complete collection and slice it in memory

This wastes database, network, and application memory and becomes increasingly
expensive as the dataset grows. It is forbidden.

### Return only the current page without metadata

Consumers cannot determine the total number of pages or build reliable
navigation. The standard response must include complete pagination metadata.

### Use cursor pagination everywhere

Cursor pagination can be more efficient for very large or frequently changing
datasets, but it has a more complex consumer contract and does not provide the
same direct page-number semantics. It remains a documented specialized
alternative, not the default contract.

## Consequences

API consumers receive a predictable collection contract, and services share a
single tested implementation. Pagination behavior can be improved centrally,
and resource code remains focused on its own query and DTO.

The shared module becomes a platform dependency that must be versioned and
tested carefully. A change to defaults, metadata, validation, or the response
shape can affect every endpoint and therefore requires API contract review.
Resource services still need tests for their filters, ordering, DTO projection,
and use of the shared paginator. Reactive services and controllers must also
preserve the Observable boundary defined by the reactive programming rules.

## Exceptions

Pagination MAY be omitted for a collection that is inherently bounded and has a
strict, documented upper limit, such as a fixed list of supported currencies or
a small enum-like configuration. The exception MUST be explicit and reviewed;
a collection being small today is not sufficient justification.

A specialized cursor-based endpoint MAY replace offset pagination for a very
large or continuously changing dataset when the endpoint documents its cursor
contract and demonstrates the need through its performance requirements. It
MUST still reuse shared pagination types and implementation utilities wherever
those abstractions apply, and MUST NOT silently introduce a third pagination
convention.

## Review Checklist

- [ ] The collection method is paginated or has a documented bounded-collection
      exception.
- [ ] The shared `PaginationQueryDto` or equivalent contract is reused.
- [ ] The shared pagination implementation owns normalization, bounds, offsets,
      metadata, and response assembly.
- [ ] The service does not duplicate pagination logic.
- [ ] `page` defaults to `1` and uses 1-based numbering.
- [ ] `pageSize` defaults to `30` and cannot exceed the shared maximum of `100`
      without a documented exception.
- [ ] Filters are applied identically to the data and count queries.
- [ ] Ordering is explicit, stable, and deterministic.
- [ ] Pagination is executed at the database or data-source level.
- [ ] Asynchronous pagination services return an Observable, adapt Promise
  dependencies with `from()`, and compose independent reads with
  `forkJoin`.
- [ ] Controllers return the pagination Observable without a manual
  subscription, and no generic resilience policy was added implicitly.
- [ ] The response uses a resource-specific DTO inside `data`.
- [ ] Empty results and requests beyond the last page have defined behavior.
- [ ] OpenAPI uses the shared paginated-response decorator and concrete DTO.
- [ ] Relevant indexes, query count, latency, and response-size impacts have
      been considered.
- [ ] Service and contract tests cover defaults, bounds, filters, ordering,
      metadata, empty results, and the shared implementation interaction.

## References

- Performance targets are project-specific; this skill does not currently
  define a shared performance rule set.
- [Use typed DTO projections in reactive business services](../design/003-response-dtos-and-reactive-projections.md)
- [Use REST resources with explicit response views](../design/002-rest-resource-and-response-views.md)
- [Use Prisma as the ORM](../database/001-prisma-orm.md)
- [Reactive programming rules](../reactive-programmation/README.md)
- [Adapt Promise-based dependencies with `from()`](../reactive-programmation/003-promise-to-observable-conversion.md)
- [Preserve reactive boundaries in services and controllers](../reactive-programmation/004-service-and-controller-design.md)
- [Keep reactive composition separate from resilience policies](../reactive-programmation/005-composition-vs-resilience.md)