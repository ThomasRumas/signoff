# Rule: Use NestJS DTOs for Validation and Transformation

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript APIs that receive or return HTTP data.
It defines the default DTO, validation, transformation, and serialization
libraries for the API boundary.

## Context

Network payloads are untrusted plain JavaScript objects. TypeScript interfaces
do not exist at runtime, so they cannot by themselves validate or transform
request data. Persistence types also describe internal storage rather than the
contract with an API consumer.

NestJS provides `ValidationPipe` backed by `class-validator` and
`class-transformer`. These libraries support concrete DTO classes, declarative
constraints, transformation, and controlled property handling at the HTTP
boundary.

## Decision

Every NestJS API MUST define project-owned concrete DTO classes for its HTTP
request and response contracts. Request DTOs MUST use `class-validator`
decorators and NestJS `ValidationPipe`. `class-transformer` MUST be used through
the pipe or explicit DTO mapping when transformation or controlled
serialization is required.

The default validation configuration MUST enable `transform: true` and
`whitelist: true`. `forbidNonWhitelisted: true` SHOULD be enabled when the API
must reject unknown properties instead of stripping them.

The class-based NestJS approach using `class-validator` and
`class-transformer` is the standard for these APIs. Zod MUST NOT be introduced
as the default validation library. A project that needs a schema-first
alternative MUST document an exception and provide equivalent validation,
transformation, and OpenAPI behavior.

## Rules

- Request DTOs MUST be concrete runtime classes, not only interfaces or type
  aliases.
- Request DTOs MUST validate bodies, query parameters, and path parameters
  wherever their values affect an operation.
- Response DTOs MUST define the consumer contract separately from request DTOs
  when their semantics differ.
- DTOs MUST be separate from Prisma, ORM, and database entity types.
- `ValidationPipe` MUST be applied globally or consistently at the relevant
  controller boundary. Global configuration SHOULD be preferred for common
  rules.
- `transform: true` SHOULD be used when DTO instances or primitive conversion
  are required. Developers MUST understand the conversion behavior for query
  and path values, which arrive as strings over HTTP.
- `whitelist: true` MUST be enabled to strip properties without validation
  decorators. `forbidNonWhitelisted: true` SHOULD be used for strict input
  contracts.
- Production validation errors MUST use the API error contract and MUST NOT
  reveal implementation details.
- DTO classes MUST be imported as runtime values where NestJS needs reflection
  metadata; type-only imports MUST NOT be used for those parameters.
- `class-transformer` decorators such as `@Expose` and `@Exclude` MAY be used
  for controlled serialization, but explicit response mapping in a business
  service remains the preferred way to derive business values.
- DTO validation rules and response fields MUST be represented in OpenAPI as
  far as the selected tooling supports.

## Rationale

Concrete DTOs create an explicit boundary between untrusted transport data,
business models, persistence records, and public responses. The NestJS default
libraries provide one consistent approach for validation and transformation,
while whitelisting limits accidental input and output exposure.

## Alternatives Considered

### Use Zod as the default

Zod is a valid schema-first option and NestJS documents a separate
`StandardSchemaValidationPipe` for it. This cookbook chooses the class-based
`ValidationPipe` because it is the established NestJS default requested for
these APIs and integrates directly with concrete DTO classes and decorators.
Projects may use Zod only through a documented exception.

### Validate only with TypeScript types

TypeScript types are erased at runtime and cannot reject malformed network
input. Runtime validation is required at the HTTP boundary.

### Return the same DTO or entity for every direction

Input and output contracts have different security and semantic needs. Reusing
database entities or accepting response DTOs as request models increases
coupling and can expose fields unintentionally.

## Consequences

Projects must install and configure `class-validator` and `class-transformer`,
maintain DTO classes, and keep decorators aligned with OpenAPI metadata. In
return, malformed input is rejected consistently and public contracts remain
independent of persistence models.

## Exceptions

A project MAY use `StandardSchemaValidationPipe` or another validator when a
documented technical constraint requires it. The exception MUST identify the
scope, preserve concrete public contracts, reject unknown input as appropriate,
and provide equivalent generated API documentation and error behavior.

## Examples

### Good: concrete request DTO and global ValidationPipe

```ts
// create-product.dto.ts
import { IsInt, IsNotEmpty, IsPositive, Min } from "class-validator";

export class CreateProductDto {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @IsPositive()
  priceInCents!: number;

  @IsInt()
  @Min(0)
  stockQuantity!: number;
}

// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

The request has runtime constraints and unknown properties cannot silently
enter the application.

### Good: validate the response view with a DTO

```ts
import { IsIn, IsOptional } from "class-validator";

export class ProductViewQueryDto {
  @IsOptional()
  @IsIn(["summary", "full"])
  view: "summary" | "full" = "summary";
}
```

The controller can safely select a known service method, and the default is
explicit in the DTO contract.

### Good: controlled class-transformer serialization

```ts
import { Exclude, Expose } from "class-transformer";

export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Exclude()
  internalMargin!: number;
}
```

Response DTOs can make serialization intent visible, but business derivation
still belongs in the service projection.

### Bad: persistence entity as the DTO

```ts
@Post()
create(@Body() product: Prisma.Product) {
  return this.productService.create(product);
}
```

This has no request validation and couples the public input contract to the
database schema.

### Bad: unvalidated input with a type-only contract

```ts
type CreateProductInput = {
  name: string;
  priceInCents: number;
};

@Post()
create(@Body() input: CreateProductInput) {
  return this.productService.create(input);
}
```

The type is erased at runtime and cannot reject malformed or unexpected input.

### Bad: undocumented Zod-only standard

```ts
const createProductSchema = z.object({
  name: z.string(),
  priceInCents: z.number().positive(),
});
```

Using Zod without a documented project exception and equivalent OpenAPI
contract does not follow the default rule.

## References

- [NestJS ValidationPipe](https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe)
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [003-response-dtos-and-reactive-projections.md](003-response-dtos-and-reactive-projections.md)