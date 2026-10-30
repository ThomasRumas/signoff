# Rule: Aggregate Repeated Frontend Workflows in an API-Owned Route

## Status

Accepted

## Scope

This implementation rule applies to NestJS/TypeScript APIs that serve
frontend applications and combine data from several independent business
services. The API-owned BFF principle is portable, but the reactive composition
and controller/service guidance below is NestJS-specific. The latency values
are current-profile targets, not universal API requirements.

## Context

A frontend workflow that calls three or four business services independently
must coordinate several URLs, loading states, authorization failures, retries,
and response transformations. The additional network round trips increase
latency and make every frontend repeat the same orchestration.

When the workflow is stable and belongs to the API's business responsibility,
the API can provide one consumer-oriented route. The API then has one place to
compose the services, apply authorization, shape the response, and measure the
complete request path.

## Decision

When a repeated frontend workflow needs data from roughly three or four
business services, the API MUST review and normally expose one API-owned
aggregate route, similar to a Backend-for-Frontend, when the workflow is
shared, API-owned, and aggregation reduces frontend orchestration or latency.
The service count is a strong design signal, not an automatic hard limit.

An aggregate route MUST represent a named frontend or business workflow, have
a clear owner, and return one typed public DTO. Its application service MUST
compose the required business services reactively and MUST preserve the
authorization, error, observability, and performance contracts of the API.

## Rules

- The aggregation decision MUST document the frontend workflow, the services
  involved, the repeated orchestration being removed, and why the API owns the
  composition.
- The aggregate route MUST be named after the consumer-facing business result,
  not after the internal services being joined. For example,
  `GET /product-pages/:id` may return the data needed to render one product
  page.
- API-owned aggregation SHOULD be preferred when frontend fan-out would add
  enough network or coordination overhead to threaten the applicable
  performance target. Independent calls SHOULD be parallelized so the
  aggregate latency is closer to the slowest dependency than the sum of all
  dependency latencies.
- The aggregate operation MUST have one accountable API or team owner. Adding
  a dependency, changing a component contract, or expanding the response MUST
  trigger review by that owner.
- The application or BFF service MUST orchestrate business-service clients.
  The controller MUST remain a thin HTTP adapter and MUST NOT call several
  repositories or services itself.
- Independent read operations SHOULD run in parallel with RxJS operators such
  as `forkJoin`. Sequential composition MUST have a documented dependency or
  business reason.
- Each dependency MUST have an explicit timeout, retry, fallback, or failure
  policy appropriate to its operation. Partial responses MAY be returned only
  when the aggregate contract explicitly defines which sections are optional
  and how incomplete data is represented.
- Authorization MUST be evaluated for the aggregate workflow and each
  underlying service call. Aggregation MUST NOT widen access because data was
  requested through a different route.
- The route MUST return a dedicated aggregate DTO. It MUST NOT concatenate raw
  service responses, expose internal service fields, or make the frontend
  understand service boundaries.
- The aggregate response MUST contain only the data needed for the documented
  workflow. It MUST NOT become an unrestricted read-all endpoint.
- The complete aggregate request MUST be measured from request receipt through
  response completion. Dependency latency, failures, request rate, response
  size, and aggregate latency MUST be observable.
- The aggregate route MUST meet the current profile target of p95 `< 300 ms`
  and p99 `< 800 ms` at sustained `100 calls/s`, unless it has a documented
  endpoint-specific exception under the project's performance policy. These
  values MUST NOT be assumed for APIs outside this profile.
- Aggregate service and HTTP tests MUST cover successful composition,
  authorization, dependency failures, partial-data behavior where supported,
  response shape, and the service interaction contract.
- The aggregate route MUST be documented in OpenAPI as a distinct public
  response schema, including its dependencies' optional or required sections
  and relevant error statuses.
- An aggregate route MUST be reconsidered when it combines unrelated
  workflows, accumulates unbounded dependencies, develops unclear ownership,
  has incompatible authorization models, or should instead be an asynchronous
  job.

## Rationale

API-owned aggregation removes repeated frontend network orchestration and can
reduce consumer-visible latency by running independent reads in parallel. It
also centralizes authorization, transformation, error semantics, and
performance measurement around the workflow that needs them.

The safeguards keep the pattern focused. A BFF route is a business-facing
composition, not permission to create a generic gateway that joins every
available service.

## Alternatives Considered

### Let the frontend call every service

This gives the frontend more control but adds network round trips, duplicated
composition and authorization handling, and inconsistent loading and error
behavior. It is not the default for a repeated workflow that clearly belongs
to the API.

### Put the composition in the controller

Controllers then become coupled to several service contracts and own failure
and mapping behavior. An application or BFF service provides a reusable,
testable owner while the controller remains an HTTP adapter.

### Create a generic mega-endpoint

A route that joins unrelated domains or grows without a bounded use case has
unclear ownership, high failure coupling, and difficult performance behavior.
The rule requires a named workflow and a bounded DTO instead.

### Make every aggregation asynchronous

Most frontend page workflows need a synchronous response. Asynchronous jobs are
appropriate when the aggregate operation cannot meet its documented synchronous
target or performs long-running work; they are not required merely because
multiple services are involved.

## Consequences

The API owns additional orchestration, dependency monitoring, and aggregate
contract tests. Component-service changes can affect the aggregate route and
must be coordinated with its owner. Consumers receive one workflow-oriented
contract with fewer network calls and less knowledge of internal service
boundaries.

## Exceptions

A frontend MAY orchestrate services directly when the workflow is genuinely
client-specific, the composition is not reusable or API-owned, or separate
authorization and lifecycle boundaries make aggregation inappropriate. The
decision and its performance impact MUST be documented.

An aggregate route MAY exceed its profile latency target only through the
project's documented performance-exception process. If the work is
long-running or resource-intensive, the API SHOULD expose an asynchronous job
instead.

## Examples

### Good: one product-page route for a repeated workflow

```text
GET /product-pages/product-123

ProductPageResponse {
  product: { id, name, description },
  price: { amount, currency },
  availability: { status, deliveryDate },
  reviews: { averageRating, count }
}
```

The frontend receives one bounded contract while the API service composes the
product, pricing, inventory, and reviews business services.

### Good: parallel reactive composition in the application service

```ts
@Injectable()
export class ProductPageService {
  constructor(
    private readonly productService: ProductService,
    private readonly pricingService: PricingService,
    private readonly inventoryService: InventoryService,
    private readonly reviewsService: ReviewsService,
  ) {}

  getProductPage(productId: string): Observable<ProductPageResponse> {
    return forkJoin({
      product: this.productService.getPublicProduct(productId),
      price: this.pricingService.getCurrentPrice(productId),
      availability: this.inventoryService.getAvailability(productId),
      reviews: this.reviewsService.getSummary(productId),
    }).pipe(
      map(({ product, price, availability, reviews }) => ({
        product,
        price,
        availability,
        reviews,
      })),
    );
  }
}
```

Each component service returns a public business result, and the aggregate
service returns one frontend-oriented DTO without manual subscription.

### Good: thin controller with one aggregate route

```ts
@Controller("product-pages")
export class ProductPageController {
  constructor(private readonly productPageService: ProductPageService) {}

  @Get(":id")
  get(@Param("id") id: string): Observable<ProductPageResponse> {
    return this.productPageService.getProductPage(id);
  }
}
```

The controller exposes the workflow and delegates composition and mapping to
the application service.

### Bad: frontend fan-out for a shared workflow

```ts
const [product, price, availability, reviews] = await Promise.all([
  api.get(`/products/${id}`),
  api.get(`/prices/${id}`),
  api.get(`/inventory/${id}`),
  api.get(`/reviews/${id}`),
]);
```

When multiple frontends repeat this orchestration, the API should own the
workflow and expose one aggregate route.

### Bad: controller orchestrates internal services

```ts
@Get(":id")
async get(@Param("id") id: string) {
  const product = await this.productService.getRaw(id);
  const price = await this.pricingService.getRaw(id);
  const stock = await this.inventoryService.getRaw(id);
  return { product, price, stock };
}
```

This leaks internal results, uses a separate asynchronous abstraction, and
leaves authorization, failure policy, and response design in the controller.

### Bad: unbounded mega-endpoint

```text
GET /dashboard/everything

Combines products, customers, orders, payments, warehouses, marketing,
notifications, audit logs, and six other unrelated services.
```

This has no bounded workflow or clear ownership and should be split into
purpose-built routes or redesigned as separate asynchronous operations.

## References

- [001-business-oriented-api-design.md](001-business-oriented-api-design.md)
- [003-response-dtos-and-reactive-projections.md](003-response-dtos-and-reactive-projections.md)
- [005-openapi-contracts-for-business-responses.md](005-openapi-contracts-for-business-responses.md)
- [Reactive service and controller design](../reactive-programmation/004-service-and-controller-design.md)
- [Reactive composition and resilience](../reactive-programmation/005-composition-vs-resilience.md)
- [API error contract](../observability/001-api-error-contract.md)
- [Controller and HTTP testing](../testing-strategy/004-controller-and-http-testing.md)

This skill does not currently include a standalone performance rule set;
latency targets and exception processes must come from the project's own
documented policy.