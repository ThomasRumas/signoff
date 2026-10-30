# Rule: Separate Stores from Services

## Status

Accepted

## Scope

This rule applies to the boundary between shared stores, UI components,
reusable reactive behavior, and client services. The code example uses Vue and
Pinia.

## Context

A shared store and a service both coordinate application behavior, but they
have different responsibilities. Combining them causes API calls, business
transformations, and state lifecycle to become difficult to test and reuse.

## Decision

The store owns shared state and its lifecycle. The service owns business/data
operations and returns data. The view or component chooses how state is
presented. In Vue, Pinia can implement the shared store and Composition API
state can implement local ownership.

```text
View or component
      |
      v
Shared state store
  shared state
  loading lifecycle
  request coordination
      |
      v
Client or business service
  API communication
  mapping and transformation
  framework-independent business rules
      |
      v
Project-configured API boundary
```

## Responsibility Table

| Responsibility | Owner |
| --- | --- |
| Shared state and its lifecycle | Shared state store |
| Store loading and loaded-state lifecycle | Shared state store |
| Concurrent request coordination | Shared state store |
| API communication | Focused client/business service |
| Response mapping and transformation | Focused client/business service |
| Framework-independent business rules | Focused business service |
| Component-local loading or interaction state | Component or reusable behavior module |
| Rendering and presentation decisions | Component or view |

## Rules

- A store MUST own only the shared reactive state and lifecycle justified by its responsibility.
- A store SHOULD delegate API calls, mapping, transformation, and business rules to a focused service.
- A service MUST accept explicit inputs and return typed data or errors.
- A service MUST NOT create or mutate state owned by a UI component. In Vue, this includes `ref`, `reactive`, and `computed` state.
- A service MUST NOT depend on component lifecycle, template state, or UI interaction state.
- A store MUST NOT become a generic service locator or a dumping ground for unrelated API operations.
- A service MUST use the project's documented client transport contract and MUST NOT expose credentials or infrastructure details that are not intended for browser code.
- When an operation is shared by several stores or components, move it to an abstraction that owns the shared business/data responsibility rather than keeping it in the first store.
- Component and service responsibilities MUST remain consistent with [the component service/reactivity rule](../components-management/003-component-services-reactivity-and-testability.md).

## Vue/Pinia Example

```ts
// orders.service.ts
export function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders')
}
```

```ts
// orders.store.ts
export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[] | null>(null)
  const isLoading = ref(false)

  async function fetchOrders() {
    if (orders.value !== null) return

    isLoading.value = true
    try {
      orders.value = await getOrders()
    } finally {
      isLoading.value = false
    }
  }

  return { orders, isLoading, fetchOrders }
})
```

The service communicates with the API and returns data. The store decides when shared data is loaded and owns its reactive lifecycle.

## Rationale

This boundary keeps framework-owned UI state out of services, keeps stores
focused on shared lifecycle management, and makes data operations independently
reusable and testable.

## Consequences

- Store tests can focus on state transitions and request coordination.
- Service tests can focus on API behavior, mapping, and business rules.
- A feature may require both a store and a service when it genuinely has shared reactive state and non-reactive data operations.
- Small local features may not need a store at all; apply [the local state rule](./001-local-vue-reactivity.md) first.
