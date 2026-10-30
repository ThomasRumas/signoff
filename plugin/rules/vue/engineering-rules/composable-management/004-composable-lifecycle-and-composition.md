# Rule: Manage Lifecycle and Effects Explicitly in Reusable Behavior

## Status

Accepted

## Scope

This rule applies to reusable frontend behavior that creates side effects,
coordinates asynchronous work, or composes other behavior modules. Vue
lifecycle APIs in the examples illustrate one framework implementation.

## Context

Lifecycle and side effects are valid responsibilities when reusable behavior
must start and stop with its owning UI scope. Composing smaller behavior
modules can keep complex interactions understandable, but every layer must
retain a focused purpose.

## Decision

A reusable behavior module MAY use the framework's lifecycle mechanism and
compose other behavior modules when those operations belong to its explicit
responsibility. Every side effect MUST have an appropriate cleanup path.

## Rules

- A behavior module MAY use framework lifecycle hooks when the behavior follows the consumer's lifecycle. In Vue, examples include `onMounted` and `onUnmounted`.
- Side effects such as timers, event listeners, subscriptions, observers, and polling MUST be cleaned up when their owner is unmounted or stopped.
- A behavior module SHOULD use the lifecycle scope that created the side effect rather than relying on a caller to remember cleanup.
- A behavior module MAY compose smaller behavior modules. Vue examples include `useFetch`, `usePagination`, `useSorting`, or `useDebounce`.
- A composed behavior module MUST preserve clear ownership of state, side effects, and returned operations.
- A behavior module MUST NOT hide unrelated business workflows merely because several modules can technically be called from one function.
- Asynchronous effects SHOULD define behavior for out-of-order results, cancellation, and errors when inputs or lifecycle state change.
- A composable SHOULD avoid starting side effects at module import time.
- Lifecycle-dependent behavior SHOULD be tested with the framework's smallest suitable lifecycle harness; pure logic SHOULD be tested without unnecessary rendering.

## Vue Example: Lifecycle Cleanup

```ts
import { onMounted, onUnmounted } from 'vue'

export function usePolling(
  callback: () => Promise<void>,
  interval: number,
) {
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => void callback(), interval)
  })

  onUnmounted(() => {
    if (timer !== undefined) {
      clearInterval(timer)
    }
  })
}
```

The polling timer belongs to the composable because it follows the component lifecycle, and cleanup belongs to the same owner.

## Vue Example: Composing Reusable Behavior

```ts
export function useOrderList() {
  const page = usePagination()
  const filters = useOrderFilters()
  const orders = useOrders(() => ({
    page: page.currentPage.value,
    filters: filters.value,
  }))

  return {
    ...page,
    ...filters,
    ...orders,
  }
}
```

`useOrderList` coordinates reusable reactive behavior. API communication and order mapping remain in the business service consumed by `useOrders`.

## Lifecycle Decision Tree

```text
Does the behavior create a timer, listener, subscription, observer, or polling loop?
|
+-- YES -> Is its lifetime tied to a component or composable scope?
|          |
|          +-- YES -> Create and clean it up inside a lifecycle-aware behavior module.
|          `-- NO  -> Use the explicit application owner for that resource.
|
`-- NO -> Does the behavior coordinate reusable state or derived values?
           |
           +-- YES -> Compose focused behavior modules when each responsibility remains clear.
           `-- NO  -> Keep it local or use a service/utility.
```

## Rationale

Lifecycle ownership makes cleanup reliable, while focused composition lets
views consume complex behavior without taking responsibility for each
framework-specific implementation detail.

## Consequences

- Lifecycle-aware composables need tests for setup and cleanup.
- Composition can reduce duplication but must not obscure ownership.
- Side effects become easier to reason about when their creator also owns their teardown.

## References

- [Vue lifecycle hooks](https://vuejs.org/guide/essentials/lifecycle.html)
- [Vue composables](https://vuejs.org/guide/reusability/composables.html)
- [Composable testing](006-composable-testing-and-anti-patterns.md)
