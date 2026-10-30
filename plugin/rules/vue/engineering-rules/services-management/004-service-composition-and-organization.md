# Rule: Compose Services Around Business Domains

## Status

Accepted

## Scope

This rule applies to service dependencies, service folder organization, and the growth of service-related files within a front-end application.

## Context

A business workflow may need several focused capabilities. Services should be composable without becoming a technical dumping ground, and their folder structure should remain understandable as the domain grows.

## Decision

Organize services by business domain or responsibility. A higher-level service MAY coordinate lower-level services when the workflow has a clear owner and the dependencies remain focused.

```text
services/
  authentication/
    authentication.service.ts
  customers/
    customer.service.ts
  orders/
    order.service.ts
    order.mapper.ts
    order.validator.ts
  permissions/
    permission.service.ts
```

## Rules

- Service folders MUST represent business domains or meaningful application responsibilities.
- A service MAY call another service when the higher-level operation explicitly owns the workflow that joins their responsibilities.
- A composed service MUST coordinate the workflow; it MUST NOT absorb every operation of its dependencies.
- Lower-level services SHOULD retain ownership of their own validation, mapping, and business operations.
- Services MUST NOT depend on UI components, views, or component-local state.
- Shared service dependencies MUST remain acyclic where practical. A cycle indicates that responsibilities may be combined incorrectly or need a different owner.
- Additional files such as mappers, validators, DTOs, or API adapters MAY be added when the domain complexity justifies them.
- Service subfolders and helper files MUST NOT be created speculatively before the domain needs those boundaries.
- Technical names such as `common.service.ts`, `utility.service.ts`, or `data.service.ts` MUST NOT be used for unrelated operations.

## Example

```ts
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const customer = await getCustomer(input.customerId)
  validateCustomerCanOrder(customer)

  const products = await getProducts(input.productIds)
  validateProductsCanBeOrdered(products)

  const payload = mapOrderToApi(input, customer, products)
  const response = await apiFetch<OrderApiResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return mapOrderFromApi(response)
}
```

The order service owns order creation. Customer and product services retain their own responsibilities and are used only for the checks required by this workflow.

## Avoid Generic Services

```text
Avoid:
services/
  api.service.ts
  data.service.ts
  helper.service.ts
  common.service.ts
  utility.service.ts
```

These names do not communicate ownership and tend to accumulate unrelated methods such as date formatting, user lookup, order creation, email validation, and tax calculation.

Prefer named domain responsibilities:

```text
services/
  orders/order.service.ts
  customers/customer.service.ts
  pricing/pricing.service.ts
  authentication/authentication.service.ts
```

## Rationale

Domain organization makes service ownership discoverable. Composition supports real workflows without sacrificing the focus of the services that provide individual capabilities.

## Consequences

- Service dependencies are visible in the domain structure.
- Complex workflows may require a higher-level orchestration service.
- Domain boundaries need periodic review as responsibilities change.
- A well-named service is easier to test and reuse than a generic utility container.

## Exceptions

A technical service MAY exist for a cross-cutting infrastructure concern when its responsibility is explicit, such as a client transport adapter. It MUST NOT become a collection of unrelated business operations.
