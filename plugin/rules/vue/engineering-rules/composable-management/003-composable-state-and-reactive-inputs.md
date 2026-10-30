# Rule: Keep Reusable Behavior State Scoped and Inputs Reactive

## Status

Accepted

## Scope

This rule applies to state, inputs, and side effects in reusable frontend
behavior modules. Vue refs and watchers in the examples illustrate the
framework-independent decisions.

## Context

A reusable behavior module normally creates a new state instance each time it
is called. Reactive inputs allow that instance to respond to changing values.
Module-level state silently changes this model and makes ownership unclear.

## Decision

Reusable behavior modules MUST create instance-scoped state by default and MAY
accept reactive inputs when their behavior must respond to changing values.
State shared across independent views MUST be promoted to an explicit shared
store. In Vue, this is commonly a Pinia store.

## Rules

- A reusable behavior module MUST create its local state inside the module function rather than as implicit global state.
- Two calls to the same reusable behavior module SHOULD normally produce independent state instances.
- A reusable behavior module MUST NOT expose module-level state as an implicit global store.
- A reusable behavior module MAY accept a plain value or reactive input when its behavior needs to respond to changes.
- Reactive inputs MUST be read in the framework's tracked reactive context when changes are intended to trigger behavior. In Vue, this may be a watcher or computed value.
- A watcher, subscription, or equivalent effect MUST have a clear source and SHOULD avoid unnecessary requests or side effects.
- A reusable behavior module SHOULD define what happens when an input changes during an in-flight asynchronous operation, including cancellation, stale-result protection, or intentional last-write behavior.
- State required by independent views MUST be owned by a shared store, with its lifecycle and request coordination explicit.
- A reusable behavior module MAY consume a store, but MUST NOT conceal cross-view shared state in module scope.
- A reusable behavior module MUST return only state and operations that form its public contract.

## Example: Independent Instances

```ts
const firstList = useOrders()
const secondList = useOrders()

// Each call owns its own data, loading state, and error state.
```

## Example: Reactive Input

```ts
import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { getOrder } from '@/services/orders/order.service'

export function useOrder(orderId: MaybeRefOrGetter<string>) {
  const order = ref<Order | null>(null)
  const isLoading = ref(false)

  async function load() {
    isLoading.value = true

    try {
      order.value = await getOrder(toValue(orderId))
    } finally {
      isLoading.value = false
    }
  }

  watch(() => toValue(orderId), load, { immediate: true })

  return { order, isLoading, load }
}
```

`toValue` normalizes a plain value, ref, or getter. The watcher makes the reload behavior explicit.

## Shared Store Decision Tree

```text
Does more than one independent view need the same reactive state instance?
|
+-- YES -> Use a shared store and test its shared lifecycle. In Vue, Pinia is one option.
|
`-- NO -> Does the behavior need reusable framework state or lifecycle?
           |
           +-- YES -> Use an instance-scoped composable.
           `-- NO  -> Keep it local or use a service/utility.
```

## Anti-Pattern

```ts
import { ref } from 'vue'

const orders = ref<Order[] | null>(null)

export function useOrders() {
  return { orders }
}
```

This is hidden global state. It should become an explicit shared store when
independent views must share it, or move the state inside `useOrders` when each
consumer needs an independent instance.

## Rationale

Explicit scope prevents accidental global state and makes reactive input behavior predictable for consumers and tests.

## Consequences

- Instance-scoped composables are safe to reuse across unrelated consumers.
- Reactive inputs may require request cancellation or stale-result handling.
- Promoting state to a store introduces shared lifecycle and testing responsibilities.

## References

- [Use a store for genuinely shared state](../reactivity-management/003-when-to-use-a-pinia-store.md)
- [Deduplicate shared store fetches](../reactivity-management/005-store-fetch-deduplication.md)
- [Composable or service decision tree](002-composable-or-service-decision-tree.md)
- [Vue composables](https://vuejs.org/guide/reusability/composables.html)
- [Vue reactivity fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
