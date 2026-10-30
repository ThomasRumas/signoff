# Rule: Use Explicit APIs for Reusable Behavior

## Status

Accepted

## Scope

This rule applies to names, returned values, data loading, and the boundary
between reusable stateful behavior and stateless utilities. Vue composables
are used as the concrete example.

## Context

Reusable behavior APIs are consumed by views and components, so their names,
returned state, and operations form a public contract. An explicit API keeps
behavior discoverable and prevents it from becoming a hidden service or global
store.

## Decision

Reusable behavior modules MUST communicate a focused responsibility through a
small, explicit public API. A Vue composable SHOULD return an object containing
individual refs and reactive values so consumers can use them without
preserving a hidden object identity.

## Rules

- Names MUST describe the reusable behavior and SHOULD follow the framework's
  convention. Vue composables commonly use the `useXxx` prefix.
- Generic names such as `useUtils`, `useCommon`, `useEverything`,
  `useApplication`, and `useData` SHOULD NOT be used for mixed responsibilities.
- A behavior module SHOULD return a small, explicit object or value that
  exposes only its public state and operations. Vue composables commonly return
  refs, computed values, and operations in an object.
- Returned reactive values MUST preserve their framework reactivity when
  consumers destructure or pass them onward.
- A behavior module SHOULD expose operations such as `refresh`, `reset`, or
  `load` only when they are part of its public responsibility.
- Loading, error, data, refresh, cancellation, and request lifecycle behavior
  MAY belong in a behavior module when they are consumer-facing stateful
  concerns.
- API communication, request construction, validation, response mapping, and
  business transformations SHOULD remain in a service.
- A behavior module that only forwards a service function without adding
  stateful behavior SHOULD be removed or kept as a normal function.
- Stateless formatting, parsing, and calculation helpers SHOULD remain normal
  utilities unless they need framework state.
- A behavior module MUST NOT expose credentials or private infrastructure
  details to its consumers.

## Vue Example: Return Shape

```ts
export function useOrders() {
  const data = ref<Order[] | null>(null)
  const isLoading = ref(false)
  const error = ref<unknown>(null)

  return {
    data,
    isLoading,
    error,
    refresh,
  }
}
```

Consumers can destructure the refs while retaining their reactive behavior:

```ts
const { data, isLoading, error, refresh } = useOrders()
```

## Fetch Boundary

```text
Reusable behavior module (Vue: composable)
  owns reactive data, loading, error, refresh, and lifecycle

Business service
  owns API calls, validation, mapping, and business/data transformations
```

A behavior module may call a service, but the service must remain usable by a
view, component, store, behavior module, or test without Vue.

## Decision Tree

```text
Does the function return or coordinate framework-managed reactive state?
|
+-- YES -> Is the behavior reusable across views or components?
|          |
|          +-- YES -> Use a focused behavior module (Vue: composable) with an explicit public API.
|          `-- NO  -> Keep the reactive behavior in its owner.
|
`-- NO -> Does it own business/data behavior or API/frontend mapping?
           |
           +-- YES -> Use a business service.
           `-- NO  -> Use a normal stateless utility.
```

## Examples

```ts
// Normal utility: no Vue dependency.
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} EUR`
}
```

```ts
// Business service: business/API behavior without Vue.
export function mapOrderFromApi(response: OrderApiResponse): Order {
  return {
    id: response.id,
    customerId: response.customer_id,
    lines: response.lines.map((line) => ({
      productId: line.product_id,
      quantity: line.quantity,
    })),
  }
}
```

## Rationale

Explicit names and return values make reusable behavior discoverable and
preserve a clean boundary between stateful UI behavior and independent
business/data operations.

## Consequences

- Consumers can use reusable behavior without knowing its internal
  implementation.
- Services remain reusable outside a UI framework.
- A behavior module API may evolve when its responsibility changes and should
  be reviewed like any other public contract.

## References

- [Service or reusable behavior decision](002-composable-or-service-decision-tree.md)
- [Service and UI boundaries](../services-management/002-service-and-ui-boundaries.md)
- [Vue composables](https://vuejs.org/guide/reusability/composables.html)