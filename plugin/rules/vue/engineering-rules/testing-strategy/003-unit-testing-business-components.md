# Rule: Unit-Test Business Components at UI and Service Boundaries

## Status

Accepted

## Scope

This rule applies to business components that combine business-specific UI
behavior with a component service or other business logic. The code example
uses Vue.

## Context

A business component has two related but distinct test boundaries. Its service
owns business/data behavior, while the component owns rendering, interaction,
UI state, lifecycle coordination, and presentation of service results.

## Decision

Business components MUST have both:

1. Isolated unit tests for their component service or business logic.
2. Component tests for their UI behavior and coordination with the service.

The two suites MUST remain focused on their respective responsibilities.

## Rules

- Component-service tests MUST follow [002-unit-testing-services.md](002-unit-testing-services.md).
- Component tests MUST verify meaningful rendered states, user interactions, state changes, lifecycle behavior, service invocation, successful results, and service failures where applicable, using the target framework's public test utilities.
- Component tests SHOULD mock the component service so they test the component contract without repeating service mapping or API tests.
- Service tests MUST verify business rules, mapping, validation, and API behavior directly; component markup MUST NOT be the only evidence for those behaviors.
- Tests SHOULD interact through public props, emitted events, slots, accessible queries, and visible results.
- Tests MUST NOT assert private component methods or internal implementation details as their primary contract.
- A business component MUST NOT be considered covered merely because its service has unit tests.
- A business component MUST NOT be considered covered merely because a view E2E test happens to render it.
- UI state such as loading, empty, success, and error presentation SHOULD be tested at the component boundary when the component owns that state.
- The component test setup SHOULD avoid real network calls and unrelated application infrastructure.

## Vue Example

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CustomerCard from './CustomerCard.vue'
import { loadCustomer } from './customer.service'

vi.mock('./customer.service', () => ({
  loadCustomer: vi.fn(),
}))

describe('CustomerCard', () => {
  it('shows the loaded customer name', async () => {
    vi.mocked(loadCustomer).mockResolvedValue({
      id: 'customer-1',
      name: 'Ada Lovelace',
    })

    const wrapper = mount(CustomerCard, {
      props: { customerId: 'customer-1' },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.get('[data-testid="customer-name"]').text()).toBe(
      'Ada Lovelace',
    )
    expect(loadCustomer).toHaveBeenCalledWith('customer-1')
  })

  it('shows an error when loading fails', async () => {
    vi.mocked(loadCustomer).mockRejectedValue(new Error('Request failed'))

    const wrapper = mount(CustomerCard, {
      props: { customerId: 'customer-1' },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.get('[role="alert"]').text()).toContain('Request failed')
  })
})
```

This component test verifies UI behavior and service coordination. The service's request and response mapping remains in the isolated service suite.

## Rationale

Testing both boundaries protects business behavior and user-visible component
behavior without forcing every rule through a browser or every UI detail into
a service test.

## Consequences

- Business components require more than one focused test suite when they own both UI and business/data behavior.
- Component tests need stable public selectors and explicit service seams.
- E2E tests remain necessary for view navigation and cross-component user journeys.

## References

- [Component services, reactivity, and testability](../components-management/003-component-services-reactivity-and-testability.md)
- [Service testability and maintenance](../services-management/006-service-testability-and-maintenance.md)
- [Testing practices and organization](009-testing-practices-and-organization.md)
