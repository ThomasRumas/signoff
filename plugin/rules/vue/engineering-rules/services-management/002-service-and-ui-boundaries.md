# Rule: Keep Services Independent from Vue UI Concerns

## Status

Accepted

## Scope

This rule applies to standalone and component-owned services used by frontend
views, components, reusable behavior modules, or stores. Vue APIs in examples
illustrate the framework-independent boundary.

## Context

A service exists independently from the UI. Coupling it to framework
reactivity, component lifecycle, DOM state, or presentation behavior makes it
difficult to call and test independently and obscures state ownership.

## Decision

Services operate on explicit inputs and return data or errors. Components,
views, reactive behavior modules, or stores own UI state and decide how service
results affect presentation.

```text
Vue view or component
  UI state, interaction, lifecycle
        |
        v
Service
  business rules, data operations, API coordination
        |
        v
Application API boundary
```

## Rules

- A service MUST NOT create or mutate framework-owned state that belongs to a component or view. In Vue, this includes `ref`, `reactive`, and `computed` values.
- A service MUST NOT depend on component lifecycle hooks, mounted instances, template state, or DOM manipulation.
- A service MUST NOT own UI loading indicators, modal visibility, button state, notifications, or component-specific interaction state.
- A service SHOULD accept explicit inputs and return typed data, transformed data, or a meaningful error.
- A service MAY perform business validation, mapping, conversion, calculation, and API communication when those operations are independent from UI state.
- Loading state belongs to the caller unless it is shared state owned by a store. See the [state ownership rules](../reactivity-management/README.md).
- A service MUST use the project's documented client transport contract and MUST NOT expose credentials or infrastructure details that are not intended for browser code.
- A service MUST NOT be implemented as a framework lifecycle abstraction when it does not own reactive behavior. In Vue, a composable is appropriate for reusable Vue-reactive behavior; a service is appropriate for non-UI business/data operations.
- The [component service/reactivity rule](../components-management/003-component-services-reactivity-and-testability.md) applies to services attached to business components as well as standalone services.

## Bad Example

```ts
export function useOrdersService() {
  const orders = ref<Order[]>([])
  const loading = ref(false)

  async function loadOrders() {
    loading.value = true
    orders.value = await fetchOrders()
    loading.value = false
  }

  return { orders, loading, loadOrders }
}
```

This module is a state-management abstraction coupled to Vue rather than a service. It hides ownership and cannot be scoped naturally to a component instance.

## Good Example

```ts
export async function getOrders(): Promise<Order[]> {
  const response = await apiFetch<OrderApiResponse[]>('/orders')
  return response.map(mapOrderFromApi)
}
```

The caller owns the reactive lifecycle:

```ts
const orders = ref<Order[]>([])
const loading = ref(false)

async function loadOrders() {
  loading.value = true

  try {
    orders.value = await getOrders()
  } finally {
    loading.value = false
  }
}
```

## Rationale

Separating non-UI operations from framework-owned state keeps ownership visible and lets services be called from components, stores, and tests without a rendered UI.

## Consequences

- Components and stores must explicitly coordinate service results with their state.
- Services remain reusable across different UI consumers.
- UI behavior does not leak into business/data operations.
- A workflow may need both a service and a composable or store, each with a distinct responsibility.
