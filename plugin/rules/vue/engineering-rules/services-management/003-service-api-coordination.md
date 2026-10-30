# Rule: Use Services for API Contracts and Workflows

## Status

Accepted

## Scope

This rule applies to services that translate between front-end models and application API contracts or coordinate multiple operations in a business workflow.

## Context

The front-end model and API model do not always have the same shape. Putting validation, payload construction, endpoint calls, and response mapping in a view mixes UI state with business and transport concerns. A service provides a stable boundary for those operations.

The service may coordinate the front-end workflow, but business aggregation that belongs to the business API MUST remain in that API. A front-end service MUST NOT become a hidden replacement for a business backend.

## Decision

A service MAY coordinate a complete front-end-facing operation when it has a clear business responsibility. It should validate inputs, map models, call the application's API boundary, and return a front-end-friendly result.

```text
Front-end model
      |
      v
Service
  validate
  map request
  call API boundary
  map response
      |
      v
Front-end result
```

## Rules

- Services MUST use typed input and output models for meaningful business operations.
- Services SHOULD validate business conditions before sending a request when the validation is independent of UI state.
- Services SHOULD map front-end models to API request models and API responses to front-end models.
- Services MAY coordinate several API calls when the workflow is a front-end application responsibility and the calls remain within the application's API boundary.
- Services MUST NOT duplicate shared business rules or cross-service business aggregation that belongs in the business API.
- Services MUST NOT return raw persistence-shaped data when a front-end model or response projection is required.
- API access MUST use the application's client transport boundary. Direct upstream URLs, server credentials, and token handling do not belong in front-end services.
- A service SHOULD return data and errors. It SHOULD NOT decide how errors are rendered, which notification is shown, or which route the UI opens.
- A multi-step workflow service MUST preserve a clear operation boundary and MUST NOT become a collection of unrelated endpoint wrappers.

## Example

The view delegates order creation and keeps its own UI state:

```ts
// order.service.ts
export async function createOrder(order: CreateOrderInput): Promise<Order> {
  validateOrder(order)

  const payload: CreateOrderApiRequest = {
    customer_id: order.customerId,
    lines: order.lines.map((line) => ({
      product_id: line.productId,
      quantity: line.quantity,
    })),
  }

  const response = await apiFetch<OrderApiResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return mapOrderFromApi(response)
}
```

```ts
// order view or business component
const isCreating = ref(false)

async function submit(order: CreateOrderInput) {
  isCreating.value = true

  try {
    await createOrder(order)
  } finally {
    isCreating.value = false
  }
}
```

The service owns validation, request mapping, API communication, and response mapping. The caller owns UI state and presentation.

## API Boundary

When a workflow needs data from several business capabilities, first determine the owner:

```text
Is the composition specific to this front-end workflow?
|
+-- YES -> A focused front-end service MAY coordinate the API calls.
|
`-- NO
      |
      Is it shared business aggregation or a business rule?
      |
      +-- YES -> Implement it in the business API.
      `-- NO  -> Keep the calls separate or define a narrower contract.
```

## Rationale

Services protect the UI from API contract details and keep transformations and workflows testable. Explicitly preserving the business API boundary prevents frontend services from becoming an accidental second backend.

## Consequences

- API contracts can evolve behind a focused front-end service.
- Front-end workflows may require dedicated request and response types.
- Some coordination remains in the client when it is genuinely UI-specific.
- Shared business aggregation requires collaboration with the API owner rather than client duplication.
