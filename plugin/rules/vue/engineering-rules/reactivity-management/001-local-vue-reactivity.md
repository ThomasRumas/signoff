# Rule: Keep UI State Local by Default

## Status

Accepted

## Scope

This rule applies to state used by a frontend component, view, or its child
components. The decision is framework-independent; the code example uses Vue.

## Context

Most state belongs to one component or one view. Introducing a global store for local state makes ownership less visible, increases coupling, and can cause data to outlive the UI that needs it.

## Decision

Use the framework's local state mechanism by default. Keep state as close as
possible to the component or view that owns and coordinates it. In Vue this
can be implemented with Composition API state such as `ref` or `reactive`.

The relevant native APIs include `ref`, `reactive`, `computed`, `watch`, `watchEffect`, `readonly`, `toRef`, `toRefs`, `shallowRef`, and `shallowReactive`. Choose the smallest appropriate API for the state; not every value needs to be reactive.

## Rules

- Component-local state MUST use the framework's local state mechanism unless a documented requirement needs another owner.
- A view SHOULD own state required by itself and its child components.
- A parent SHOULD pass state to children through typed props and receive changes through typed emits when normal parent/child communication is sufficient.
- A framework context/provider mechanism MAY be used for state shared within one component tree when explicit parent/child communication would make ownership harder to understand. In Vue, `provide`/`inject` is one such mechanism.
- A shared store MUST NOT be introduced merely because a component has several state values, makes an API call, or contains a non-trivial amount of code.
- Values that do not change during the relevant lifetime SHOULD remain plain values rather than being wrapped in reactive state.
- Services MUST remain independent from framework-owned UI state. See [the component service boundary](../components-management/003-component-services-reactivity-and-testability.md).

## Example

This component owns the state for a request used only by its own template:

```vue
<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { getFact } from '@/services/facts'

const fact = shallowRef<string | null>(null)
const errorMessage = shallowRef<string | null>(null)
const isLoading = shallowRef(true)

async function loadFact() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await getFact()
    fact.value = response.fact
  } catch {
    fact.value = null
    errorMessage.value = 'Unable to load a fact.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadFact)
</script>
```

The service returns data. The component owns loading, error, and display state.

## Rationale

Local state makes ownership, lifecycle, and cleanup obvious. It also keeps components easier to reason about and avoids global state that has no independent consumer.

## Consequences

- State stays close to the UI that uses it.
- Parent/child communication remains explicit.
- Some state may be lifted to a view or store when its consumers expand.
- A component can become responsible for coordination; move reusable business/data operations to a focused service when needed.

## Exceptions

A different state owner MAY be used when the state must be synchronized across independent views or must survive navigation between views. Use [the ownership and escalation rule](./002-state-ownership-and-escalation.md) before introducing a shared store.
