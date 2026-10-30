# Rule: Choose Between a Service and Reactive Behavior

## Status

Accepted

## Scope

This rule applies when frontend logic could plausibly be implemented as a
service, a reusable reactive behavior module, a shared store, or local view
behavior. Vue composables and Pinia in examples are framework-specific forms
of these abstractions.

## Context

Services and reactive behavior modules may both be reusable and may both
participate in an API-driven workflow. Their ownership differs: a service
manages business/data operations, while a reactive behavior module manages
framework state, lifecycle, and UI-facing effects around those operations.

## Decision

Use the decision tree below before creating or moving a reusable abstraction.

## Rules

- A service MUST remain independent from framework state and UI lifecycle.
- A reusable reactive behavior module MUST own behavior that depends on framework state, lifecycle, or reactive inputs.
- A shared store MUST own state shared by independent parts of the application.
- A reactive behavior module MAY consume a service, but it MUST NOT absorb the service's business rules, API mapping, or substantial data transformation.
- A service MAY be consumed by a view, component, store, reactive behavior module, or test without requiring a UI framework instance.
- A normal utility SHOULD be used when logic is stateless and has no business-service responsibility.

## Service or Composable Decision Tree

```text
Does the logic require framework state, lifecycle, or reactive inputs?
|
+-- NO -> Does it represent business rules, API communication, data transformation,
|         API/frontend mapping, or a business workflow?
|         |
|         +-- YES -> Use a business service.
|         `-- NO  -> Use a normal stateless utility.
|
`-- YES -> Is the state shared by independent parts of the application?
           |
           +-- YES -> Use a shared store for state and lifecycle.
           |          The store MAY consume a business service.
           |
           `-- NO -> Is the reactive behavior reused by views or components?
                      |
                      +-- YES -> Use the framework's reusable reactive behavior abstraction.
                      `-- NO  -> Keep the behavior in the view or component.
```

In Vue, the reactive behavior abstraction is commonly a composable and the
shared store may use Pinia. React and Svelte have their own equivalent APIs.

## Responsibility Matrix

| Responsibility | Service | Reactive behavior module | Shared store |
| --- | --- | --- | --- |
| Business rules | MUST own | MUST NOT own | MUST NOT own |
| API communication | MAY own | Through a service | Through a service |
| API/frontend mapping | MUST own | MUST NOT own | MUST NOT own |
| Data transformation | MAY own | MUST NOT own substantial transformations | MUST NOT own |
| Business workflows | MAY own | MUST NOT own | Coordinates shared state only |
| UI/framework state | MUST NOT own | MAY own local state | MUST own shared state |
| Derived values | MUST NOT own | MAY own | MAY own |
| Reactive effects/subscriptions | MUST NOT own | MAY own | MAY own when required by shared state |
| UI lifecycle | MUST NOT own | MAY own | Shared-store lifecycle only when explicit |
| Loading and error state | Returns result/error | MAY own instance state | MAY own shared state |
| Reactive inputs | MUST NOT require a UI framework | MAY accept | MAY expose shared state |
| Component-scoped behavior | MUST NOT own | MAY own | MUST NOT own |

In Vue, the reactive behavior module is commonly a composable using refs,
computed values, watchers, and lifecycle hooks; a shared store may use Pinia.

## Standard Fetching Shape

Fetching commonly needs both abstractions:

```text
View
  |
  v
Reusable reactive behavior module (Vue: composable)
  reactive data, loading, error, refresh, lifecycle
  |
  v
Business service
  API call, validation, mapping, business/data behavior
  |
  v
Application API
```

The composable answers, "How should this consumer react while data is loaded?" The service answers, "How do I retrieve and transform this business data?"

## Example

```ts
// Business service: independent from Vue.
export async function getOrders(): Promise<Order[]> {
  const response = await apiFetch<OrderApiResponse[]>('/orders')
  return response.map(mapOrderFromApi)
}
```

```ts
// Vue example: a composable owns reactive behavior for one consumer instance.
import { ref } from 'vue'
import { getOrders } from '@/services/orders/order.service'

export function useOrders() {
  const data = ref<Order[] | null>(null)
  const isLoading = ref(false)
  const error = ref<unknown>(null)

  async function refresh() {
    isLoading.value = true
    error.value = null

    try {
      data.value = await getOrders()
    } catch (cause) {
      error.value = cause
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, refresh }
}
```

## Anti-Pattern

```ts
// This mixes service and composable responsibilities.
export function useOrdersService() {
  const orders = ref<Order[]>([])
  const isLoading = ref(false)

  async function fetchOrders() {
    isLoading.value = true
    orders.value = await api.get('/orders')
    isLoading.value = false
  }

  return { orders, isLoading, fetchOrders }
}
```

If the function owns reactive behavior, use the framework's equivalent of a
composable or hook and delegate API and transformation work to a business
service. If it must share state across independent views, use a shared store;
in Vue, Pinia is one option.

## Rationale

The decision tree makes the controlling dependency visible: framework-aware
behavior points to a reusable reactive module, independent business/data
behavior points to a service, and cross-view ownership points to a shared
store.

## Consequences

- A feature may legitimately contain a view, composable, service, and store, each with a distinct responsibility.
- The service/composable boundary is testable from both sides.
- Shared state cannot be introduced accidentally through a module-level composable variable.

## References

- [Composable state and reactive inputs](003-composable-state-and-reactive-inputs.md)
- [Services management](../services-management/README.md)
- [Store and service boundaries](../services-management/005-service-component-and-store-boundaries.md)
- [State and reactivity management](../reactivity-management/README.md)
