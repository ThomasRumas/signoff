# Rule: Test Reusable Behavior at Its Public Boundary

## Status

Accepted

## Scope

This rule applies to tests for reusable stateful behavior modules and to
service/store anti-patterns that reduce testability or obscure state
ownership. Vue composables and tools appear as implementation examples.

## Context

Reusable behavior modules SHOULD be tested directly when they own meaningful
state, reactive inputs, lifecycle effects, asynchronous behavior, or side
effects. These tests complement service, store, component, and end-to-end tests
rather than replacing them.

## Decision

Meaningful reusable behavior MUST be independently testable through its public
state and operations. Tests MAY use a lightweight framework harness when
lifecycle effects require a UI scope, but business-service behavior MUST
remain directly tested in service tests.

## Rules

- Tests MUST verify initial state, reactive state changes, loading behavior, errors, refresh behavior, and input-change behavior when applicable.
- Lifecycle-aware behavior MUST test setup and cleanup of timers, listeners, subscriptions, observers, or polling effects.
- Tests SHOULD verify behavior for stale, cancelled, or failed asynchronous work when the behavior module owns that behavior.
- Tests MUST mock services and external dependencies rather than call real APIs.
- Tests MUST assert public state, derived values, emitted side effects, and returned operations rather than private implementation details.
- A behavior module that only forwards a service call without adding meaningful stateful behavior does not require a separate suite; test the service and consuming owner instead.
- Business-service tests MUST cover API calls, business rules, transformations, mapping, and service errors independently from composable tests.
- Shared-store tests MUST cover shared state, lifecycle, request coordination, caching, deduplication, retry, and reset behavior owned by the store.
- End-to-end tests SHOULD cover critical navigation and user journeys; they MUST NOT be the only test of reusable behavior or service logic.
- Behavior-module test files SHOULD be colocated with their implementation or follow the project's documented equivalent organization.

## Vue Example

```ts
import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useOrder } from './use-order'
import { getOrder } from '@/services/orders/order.service'

vi.mock('@/services/orders/order.service', () => ({
  getOrder: vi.fn(),
}))

describe('useOrder', () => {
  it('reloads when its reactive input changes', async () => {
    vi.mocked(getOrder).mockResolvedValue({ id: 'order-2' })
    const orderId = ref('order-1')
    const { order } = useOrder(orderId)

    orderId.value = 'order-2'
    await nextTick()

    expect(getOrder).toHaveBeenLastCalledWith('order-2')
    expect(order.value).toEqual({ id: 'order-2' })
  })
})
```

## Anti-Patterns

### Business transformation inside a composable

```ts
export function useOrders() {
  function transformOrder(order: OrderApiResponse): Order {
    // Large business transformation does not depend on Vue.
    return mapOrderFromApi(order)
  }

  return { transformOrder }
}
```

Move the transformation to a business service and test it there.

### Business service containing framework-owned UI state

```ts
export function getOrders() {
  const orders = ref<Order[]>([])
  return orders
}
```

A service must remain independent from UI state. In Vue, local reactive state
belongs in a composable or component, while cross-view state belongs in Pinia.

### Composable used as a global store

```ts
const user = ref<User | null>(null)

export function useUser() {
  return { user }
}
```

Use a shared store when independent views need the same state. In Vue, Pinia is
one implementation option.

## Test Boundary Decision Tree

```text
What behavior is being tested?
|
+-- Business/API logic or transformation?
|     `-- Test the business service directly.
|
+-- Shared state and request lifecycle?
|     `-- Test the shared store directly.
|
+-- Reusable stateful behavior or lifecycle effects?
|     `-- Test the behavior module's public API and side effects.
|
+-- UI component rendering or interaction?
|     `-- Test the public component API (Vue example: Vue Test Utils).
|
`-- View navigation or a complete user journey?
      `-- Test the journey with the project's selected E2E runner (Vue example: Playwright).
```

## Rationale

Testing the composable boundary directly protects reactive behavior without forcing business logic through Vue or requiring every consumer to be tested in a browser.

## Consequences

- Meaningful composables need explicit public contracts and controllable dependencies.
- Some features require complementary service, composable, store, component, and E2E tests.
- Lifecycle tests may need a small harness but should not reproduce a full application.

## References

- [Frontend testing strategy](../testing-strategy/README.md)
- [Unit-test stores and composables](../testing-strategy/005-unit-testing-stores-and-composables.md)
- [Unit-test services](../testing-strategy/002-unit-testing-services.md)
- [Services management](../services-management/README.md)
- [Vue composables](https://vuejs.org/guide/reusability/composables.html)
