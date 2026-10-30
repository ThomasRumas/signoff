# Rule: Keep Services Independently Testable

## Status

Accepted

## Scope

This rule applies to the design, testing, and maintenance of front-end services.

## Context

One reason to extract reusable logic into a service is to test business
behavior without rendering a UI. A service that owns UI state or contains
unrelated responsibilities cannot be tested with a focused contract.

## Decision

A service MUST be testable through explicit inputs and outputs without
requiring a UI component, view, DOM, or rendered application. Tests should
follow the service's responsibility rather than testing its behavior
indirectly through rendering.

## Rules

- Service tests SHOULD cover business rules, data transformations, DTO mapping, API behavior, error handling, and business-specific calculations owned by the service.
- A service test MUST NOT require rendering a component to exercise non-UI business logic.
- API clients SHOULD be mocked at the service boundary so tests can assert requests and responses without contacting a real upstream system.
- Tests SHOULD verify both request mapping and response mapping when the service translates models.
- Tests SHOULD cover invalid inputs and API failures when the service owns their handling.
- Service code SHOULD expose deterministic functions with explicit inputs and outputs where practical.
- A service MUST remain focused enough that its test suite describes one coherent responsibility.
- Generic utility services SHOULD be split when their tests cover unrelated domains or require unrelated setup.
- Framework rendering, interaction state, and lifecycle behavior belong in UI or view tests; they do not justify adding framework dependencies to a service.

## Example

```ts
describe('createOrder', () => {
  it('maps the front-end order before sending it to the API', async () => {
    const result = await createOrder({
      customerId: 'customer-1',
      lines: [{ productId: 'product-1', quantity: 2 }],
    })

    expect(apiFetch).toHaveBeenCalledWith('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: 'customer-1',
        lines: [{ product_id: 'product-1', quantity: 2 }],
      }),
    })
    expect(result).toEqual(expectedOrder)
  })

  it('rejects an order without a customer', async () => {
    await expect(createOrder({ customerId: '', lines: [] })).rejects.toThrow(
      'Customer is required',
    )
  })
})
```

The service test verifies the business contract directly. A separate UI test
can verify that the submit interaction displays loading state and handles the
service result.

The frontend testing-strategy rule defines the complete service unit-test boundary in [002-unit-testing-services.md](../testing-strategy/002-unit-testing-services.md).

## Maintenance Questions

Before extending a service, ask:

```text
Does the new operation belong to the service's named responsibility?
|
+-- YES -> Add it with focused tests.
|
`-- NO
      |
      Is it a separate reusable business responsibility?
      |
      +-- YES -> Create or use the appropriate domain service.
      `-- NO  -> Keep it local or use the appropriate component/store/composable owner.
```

## Rationale

Independent tests expose whether a service has a coherent contract and prevent
business behavior from becoming inseparable from framework rendering.

## Consequences

- Services need explicit dependencies and typed contracts.
- Business behavior can be tested quickly without browser setup.
- Component tests remain focused on UI behavior.
- Splitting an overgrown service may require moving tests and updating consumers.
