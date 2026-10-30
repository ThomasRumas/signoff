# Rule: Unit-Test Front-End Services in Isolation

## Status

Accepted

## Scope

This rule applies to standalone and component-owned services that own client
integration, business rules, mapping, validation, or non-UI workflows.

## Context

Services are independent from UI rendering and component lifecycle. Their
business behavior should be verified directly rather than inferred through a
rendered component or browser journey.

## Decision

Every meaningful service MUST have an isolated unit-test suite that exercises its public contract with explicit inputs and controlled external dependencies.

## Rules

- Service tests MUST use the project's unit-test runner and MUST NOT require rendering a UI component. Vitest is the example used in this rule.
- Tests MUST control API clients, browser transport, storage, timers, and other external dependencies with mocks, stubs, or fakes.
- Tests SHOULD verify request construction, response mapping, validation, business rules, successful results, and meaningful API failures.
- Tests MUST assert returned data and meaningful dependency interactions rather than private methods or line execution alone.
- Service tests MUST cover the service's error contract when the service translates or preserves errors.
- A service test SHOULD use deterministic fixtures that make the business scenario clear.
- Tests MUST NOT contact uncontrolled external infrastructure or depend on developer credentials.
- Component tests MAY verify that a component invokes a service and handles its result, but they MUST NOT replace direct service tests for mapping or business rules.
- Service test files SHOULD be colocated with the service or follow the project's documented equivalent organization.
- Service ownership and boundaries MUST remain consistent with the [service testability rule](../services-management/006-service-testability-and-maintenance.md).

## Vitest Example

```ts
import { describe, expect, it, vi } from 'vitest'
import { createOrder } from './order.service'
import { apiFetch } from '@/api/api-fetch'

vi.mock('@/api/api-fetch', () => ({
  apiFetch: vi.fn(),
}))

describe('createOrder', () => {
  it('maps the front-end order before sending it to the API', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: 'order-1',
      customer_id: 'customer-1',
      lines: [{ product_id: 'product-1', quantity: 2 }],
    })

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
    expect(result.id).toBe('order-1')
  })

  it('rejects an order without a customer', async () => {
    await expect(createOrder({ customerId: '', lines: [] })).rejects.toThrow(
      'Customer is required',
    )
  })
})
```

The service test verifies the business and client integration contract directly.
A UI component test may separately verify loading and presentation behavior.

## Rationale

Isolated service tests are fast, deterministic, and able to identify mapping or
business-rule failures without involving UI rendering or browser infrastructure.

## Consequences

- Services need explicit dependencies and typed input/output contracts.
- API clients need a testable boundary that can be replaced in unit tests.
- Some behavior is intentionally tested at more than one level when the service result affects a business component or user journey.

## References

- [Service and UI boundaries](../services-management/002-service-and-ui-boundaries.md)
- [Service testability and maintenance](../services-management/006-service-testability-and-maintenance.md)
- [Testing practices and organization](009-testing-practices-and-organization.md)
