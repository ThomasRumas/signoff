# Rule: Document Business DTOs in OpenAPI

## Status

Accepted

## Scope

This rule applies to NestJS APIs that publish OpenAPI or Swagger contracts. It
defines the documentation requirements for business response DTOs, request
validation, response views, and HTTP behavior.

## Context

The API contract is more than a route and a status code. Consumers need to know
which query values are supported, which representation is returned, which
fields are safe and available, how pagination works, and which errors can be
handled. An undocumented DTO or view is an implementation detail that consumers
must guess.

## Decision

Every public NestJS endpoint MUST have an OpenAPI contract that describes its
request DTOs, response DTOs, supported `view` values, defaults, pagination
metadata, and relevant status codes. Summary, full, and detail responses MUST
be represented as separate schemas when their public fields differ.

The generated contract MUST be inspected locally during development. A
production deployment MUST provide a safe generated JSON schema or equivalent
contract artifact without exposing an interactive documentation surface unless
that exposure is explicitly secured and approved.

## Rules

- Controllers MUST reference public DTO classes in OpenAPI response metadata;
  database entities MUST NOT be used as the public schema by default.
- `view` MUST be documented as an enum with its default and every supported
  value.
- Request DTO validation constraints SHOULD be reflected in OpenAPI metadata
  wherever the NestJS integration supports it.
- Each materially different response view MUST have a distinct response schema
  or a precisely documented union/one-of contract.
- An API-owned aggregate route MUST have a dedicated response schema that
  documents each required and optional business section. It MUST NOT be
  documented as an untyped object or as the concatenation of service schemas.
- Pagination, filtering, sorting, and response metadata MUST be documented
  together with their types, defaults, and bounds.
- Success and error status codes MUST match the behavior implemented by the
  controller, service, and exception mapping rules.
- OpenAPI examples SHOULD show representative summary and detail payloads
  without including secrets or internal persistence fields.
- Changes to DTOs, view values, status codes, or response shape MUST trigger a
  contract review and the relevant HTTP contract tests.
- The generated OpenAPI document MUST be treated as a consumer contract, not as
  an incidental dump of TypeScript or Prisma types.

## Rationale

OpenAPI makes the business contract discoverable, supports generated clients,
and gives reviewers a concrete way to detect accidental response expansion or
missing validation. Separate schemas make frontend expectations explicit.

## Alternatives Considered

### Document only routes

Routes do not describe the fields, query enum, validation constraints, or
representation selected by the endpoint. Consumers still have to reverse
engineer the response.

### Generate schemas directly from persistence models

Persistence models contain internal fields and relationships that are not
necessarily safe or useful to consumers. Public DTOs must own the contract.

### Expose Swagger publicly by default

Interactive documentation can reveal endpoint details and operational metadata.
The contract should remain available as a controlled artifact, with interactive
exposure decided by the project's security policy.

## Consequences

DTO and decorator changes require documentation maintenance and contract review.
The resulting schema is useful to frontend developers, generated clients,
testers, and reviewers, and makes incompatible changes visible earlier.

## Exceptions

A project MAY use another schema source instead of NestJS Swagger decorators
when it is the authoritative contract. It MUST still document the same request,
response, view, validation, pagination, and status information and MUST keep
the generated artifact synchronized with the implementation.

## Examples

### Good: document the view enum and response schemas

```ts
enum ProductView {
  Summary = "summary",
  Full = "full",
}

@ApiQuery({
  name: "view",
  enum: ProductView,
  required: false,
  default: ProductView.Summary,
})
@ApiOkResponse({
  description: "Products in the selected public representation",
  schema: {
    oneOf: [
      { type: "array", items: { $ref: getSchemaPath(ProductSummaryResponse) } },
      { type: "array", items: { $ref: getSchemaPath(ProductFullResponse) } },
    ],
  },
})
@Get()
list(@Query() query: ProductViewQueryDto) {
  return this.productService.list(query.view);
}
```

The contract names the supported view values and points to public response
schemas rather than an ORM model.

### Good: document detail and pagination separately

```ts
@ApiOkResponse({ type: ProductDetailResponse })
@Get(":id")
get(@Param("id") id: string) {
  return this.productService.getProductDetails(id);
}

@ApiOkResponse({ type: ProductSummaryPageResponse })
@Get()
list(@Query() query: ProductListQueryDto) {
  return this.productService.listProductSummaries(query);
}
```

The detail response and paginated collection response are independently
discoverable contracts.

### Good: document an aggregate response

```ts
class ProductPageResponse {
  @ApiProperty({ type: ProductDetailResponse })
  product!: ProductDetailResponse;

  @ApiProperty({ type: ProductPriceResponse })
  price!: ProductPriceResponse;

  @ApiProperty({ type: ProductAvailabilityResponse })
  availability!: ProductAvailabilityResponse;

  @ApiProperty({ type: ProductReviewSummaryResponse })
  reviews!: ProductReviewSummaryResponse;
}

@ApiOkResponse({ type: ProductPageResponse })
@Get("/product-pages/:id")
getProductPage(@Param("id") id: string) {
  return this.productPageService.getProductPage(id);
}
```

The aggregate contract describes the frontend workflow directly and remains
independent from the internal contracts of the component services.

### Bad: leave the response untyped

```ts
@Get()
list(@Query("view") view?: string): Observable<any> {
  return this.productService.getProducts(view);
}
```

The contract does not identify valid views, the default, or the response shape.

### Bad: describe the database entity as the API contract

```ts
@ApiOkResponse({ type: Prisma.Product })
@Get(":id")
get(@Param("id") id: string) {
  return this.productService.findRawProduct(id);
}
```

This publishes persistence details rather than the bounded consumer contract.

## References

- [NestJS OpenAPI introduction](https://docs.nestjs.com/openapi/introduction)
- [NestJS OpenAPI decorators](https://docs.nestjs.com/openapi/operations)
- [001-business-oriented-api-design.md](001-business-oriented-api-design.md)
- [002-rest-resource-and-response-views.md](002-rest-resource-and-response-views.md)
- [004-nestjs-dto-validation-and-transformation.md](004-nestjs-dto-validation-and-transformation.md)