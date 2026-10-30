# Rule: Unit-Test Shared Stores and Stateful Behavior

## Status

Accepted

## Scope

This rule applies to shared stores and reusable behavior modules that own
meaningful state, lifecycle, asynchronous behavior, or side effects. Vue and
Pinia APIs in examples are illustrative.

## Context

Stores own state shared across independent parts of the application. Reusable
behavior modules own framework-aware behavior, usually with instance-scoped
state. Both boundaries can contain behavior that is too important to verify
only through a view or E2E test.

## Decision

Stores and meaningful stateful behavior modules MUST have focused unit tests.
Tests MUST exercise their public state and behavior, not private implementation
details.

## Store Rules

- Store tests MUST verify initial state, public actions, state transitions, successful results, meaningful failures, and reset or logout behavior where applicable.
- Store tests MUST control service dependencies and MUST NOT contact real APIs.
- Stores that coordinate requests SHOULD test lazy loading, loaded-state caching, concurrent-request deduplication, retry after failure, and stale-data behavior when those behaviors are part of the store contract.
- Store tests MUST verify that shared state changes are visible through the store's public API.
- Tests SHOULD use a fresh store instance or equivalent isolated setup for each test. In Vue, use a fresh Pinia instance.
- A store MUST NOT be tested only through a view that consumes it.

## Reusable Behavior Rules

- A behavior-module test MUST verify returned state and the reactive or lifecycle behavior exposed by that module.
- Tests SHOULD cover initial state, reactive input changes, loading and error state, refresh behavior, watcher behavior, lifecycle effects, and cleanup where applicable.
- Lifecycle-dependent behavior MAY be tested with a lightweight framework harness; in Vue, Vue Test Utils can provide the required scope.
- A behavior module that only wraps a service call without adding meaningful stateful behavior does not need a separate suite beyond service and consuming-component coverage.
- Behavior-module tests MUST NOT duplicate business-service mapping or API tests.
- Module-level state MUST NOT be introduced merely to make a behavior-module test easier; shared state belongs in a store when independent consumers require the same instance.
- Reusable behavior responsibilities MUST follow the [composable management rules](../composable-management/README.md).

## Vue/Pinia Example: Store

```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useOrdersStore } from './orders.store'
import { getOrders } from '@/services/orders/order.service'

vi.mock('@/services/orders/order.service', () => ({
  getOrders: vi.fn(),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('orders store', () => {
  it('deduplicates concurrent fetches', async () => {
    const orders = [{ id: 'order-1' }]
    vi.mocked(getOrders).mockResolvedValue(orders)
    const store = useOrdersStore()

    await Promise.all([store.fetchOrders(), store.fetchOrders()])

    expect(getOrders).toHaveBeenCalledTimes(1)
    expect(store.orders).toEqual(orders)
  })
})
```

## Vue Example: Reusable Behavior

```ts
import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useOrder } from './use-order'
import { getOrder } from '@/services/orders/order.service'

vi.mock('@/services/orders/order.service', () => ({
  getOrder: vi.fn(),
}))

describe('useOrder', () => {
  it('reloads when the reactive order id changes', async () => {
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

## Rationale

Direct tests protect shared state and reusable reactive behavior without requiring every consumer view to be mounted or every workflow to run in a browser.

## Consequences

- Stores and composables need clear public contracts.
- Lifecycle-aware composables may need a lightweight Vue test harness.
- Store tests must distinguish shared-state behavior from service behavior.

## References

- [Reactivity management](../reactivity-management/README.md)
- [Store and service boundaries](../services-management/005-service-component-and-store-boundaries.md)
- [Reusable behavior management](../composable-management/README.md)
- [Testing practices and organization](009-testing-practices-and-organization.md)
