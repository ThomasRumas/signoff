# Rule: Use Typed DTO Projections in Reactive Business Services

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript APIs using RxJS and persistence or
external data sources. It defines how business services clean raw data and
produce response-specific DTOs.

## Context

Repositories return data shaped for persistence, and external systems return
data shaped for their own contracts. Neither shape is automatically suitable
for a frontend consumer. A list, full collection, and detail operation may
need different fields and different composition.

The API already uses Observables for asynchronous business flows. Projection
must remain inside that flow so callers receive one typed business result and
NestJS retains ownership of the HTTP subscription.

## Decision

Business services MUST expose a distinct typed method for each materially
different response projection. For the product example, the service SHOULD
provide `listProductSummaries`, `listFullProducts`, and `getProductDetails`.

Each method MUST transform raw repository or external data into a project-owned
response DTO and SHOULD return an `Observable<T>` when it composes asynchronous
sources. Response DTOs MUST NOT be Prisma or ORM entity types.

## Rules

- Response DTOs MUST explicitly list the public fields and MUST NOT spread raw
  persistence objects into an HTTP response.
- The business service MUST own data cleanup, derivation, composition,
  authorization-aware selection, and conversion to the public response model.
- A separate service method SHOULD be created when a response has materially
  different fields, joins, authorization rules, or performance characteristics.
- A list projection SHOULD be smaller than a detail projection unless the
  frontend use case genuinely requires the additional data.
- Repository methods MAY select only the required persistence fields, but that
  optimization MUST NOT replace the public response DTO boundary.
- RxJS operators such as `from`, `map`, and `forkJoin` SHOULD be used to keep
  asynchronous retrieval and projection in one reactive flow.
- Controllers MUST select the appropriate service method and return its
  Observable. They MUST NOT manually subscribe or call `firstValueFrom` for a
  normal NestJS HTTP response.
- A controller MAY perform transport-only adaptation, such as reading a query
  parameter or setting a response header, but MUST NOT own business cleanup or
  derivation.
- Projection methods MUST preserve the API error and observability contracts
  defined by the related rules.

## Rationale

Named methods make each business response intentional and easy to test. DTOs
prevent persistence changes and internal fields from leaking to consumers.
Keeping the mapping in a reactive service preserves composition and lifecycle
ownership while allowing controllers to remain thin.

## Alternatives Considered

### Return `Prisma.Product` from the controller

This exposes persistence structure, makes accidental field leakage likely, and
couples the public API to database changes.

### Use one `getProducts(): Observable<any>` method

An untyped method hides which use case is being served and encourages callers or
controllers to inspect and mutate a generic result. Named DTO methods make the
contract explicit.

### Clean data in every controller

This duplicates business transformations across HTTP handlers and prevents
reuse by other transports or consumers. The service owns the business result.

## Consequences

Teams maintain more DTO and mapping code, but response contracts become
explicit, safe, testable, and independent of persistence. A new frontend view
may require a new method and schema rather than silently expanding an existing
response.

## Exceptions

A service MAY reuse a DTO mapping function when two operations have exactly the
same public semantics. The shared mapper MUST remain typed and MUST NOT be
replaced by raw object spreading. A synchronous service MAY return a value
instead of an Observable when it performs no asynchronous work.

## Examples

### Good: typed reactive projections in the service

```ts
import { Injectable } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

type RawProduct = {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  stockQuantity: number;
  internalMargin: number;
  deletedAt: Date | null;
};

export class ProductSummaryResponse {
  id!: string;
  name!: string;
  price!: number;
  availability!: "in_stock" | "out_of_stock";
}

export class ProductFullResponse extends ProductSummaryResponse {
  description!: string | null;
}

export class ProductDetailResponse extends ProductFullResponse {
  description!: string | null;
}

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  listProductSummaries(): Observable<ProductSummaryResponse[]> {
    return from(this.productRepository.findProducts()).pipe(
      map((products) => products.map((product) => this.toSummary(product))),
    );
  }

  listFullProducts(): Observable<ProductFullResponse[]> {
    return from(this.productRepository.findProducts()).pipe(
      map((products) => products.map((product) => this.toFull(product))),
    );
  }

  getProductDetails(id: string): Observable<ProductDetailResponse> {
    return from(this.productRepository.findProductById(id)).pipe(
      map((product) => this.toDetail(product)),
    );
  }

  private toSummary(product: RawProduct): ProductSummaryResponse {
    return {
      id: product.id,
      name: product.name,
      price: product.priceInCents / 100,
      availability: product.stockQuantity > 0 ? "in_stock" : "out_of_stock",
    };
  }

  private toDetail(product: RawProduct): ProductDetailResponse {
    return this.toFull(product);
  }

  private toFull(product: RawProduct): ProductFullResponse {
    return {
      ...this.toSummary(product),
      description: product.description,
    };
  }
}
```

The service removes internal fields and derives the frontend-level price and
availability values. The repository type is never used as the public response.

### Good: controller selects a validated view

```ts
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  list(@Query() query: ProductViewQueryDto) {
    return query.view === "full"
      ? this.productService.listFullProducts()
      : this.productService.listProductSummaries();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.productService.getProductDetails(id);
  }
}
```

NestJS subscribes to the returned Observable as part of the HTTP response
lifecycle. `ProductViewQueryDto` validation is defined in the DTO rule.

### Bad: expose the raw persistence entity

```ts
@Get(":id")
get(@Param("id") id: string): Observable<Prisma.Product> {
  return this.productService.findRawProduct(id);
}
```

The controller exposes a database contract and cannot guarantee that internal
fields remain private.

### Bad: business cleanup in the controller

```ts
@Get()
list() {
  return this.repository.findProducts().then((products) =>
    products.map((product) => ({
      ...product,
      availability: product.stockQuantity > 0 ? "in_stock" : "out_of_stock",
    })),
  );
}
```

The controller now owns persistence access, business derivation, and a second
asynchronous abstraction. Those responsibilities belong in the service.

### Bad: manually subscribe for HTTP

```ts
@Get()
list(): Promise<ProductSummaryResponse[]> {
  return firstValueFrom(this.productService.listProductSummaries());
}
```

This conversion is unnecessary for a normal NestJS HTTP handler and obscures
the reactive boundary.

## References

- [001-business-oriented-api-design.md](001-business-oriented-api-design.md)
- [002-rest-resource-and-response-views.md](002-rest-resource-and-response-views.md)
- [004-nestjs-dto-validation-and-transformation.md](004-nestjs-dto-validation-and-transformation.md)
- [Reactive programming default](../reactive-programmation/001-reactive-programming-default.md)
- [Service and controller design](../reactive-programmation/004-service-and-controller-design.md)
- [Prisma ORM](../database/001-prisma-orm.md)