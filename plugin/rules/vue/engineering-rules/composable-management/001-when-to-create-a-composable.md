# Rule: Create Reusable Behavior Around Meaningful Responsibilities

## Status

Accepted

## Scope

This rule applies when deciding whether frontend behavior should be extracted
from a view or component into a reusable module. Vue composables are one
framework-specific form of this abstraction.

## Context

Reusable behavior modules encapsulate stateful behavior, lifecycle, reactive
inputs, asynchronous state, or side effects shared by frontend consumers. A
framework may call this abstraction a hook or composable. Stateless helpers
and business/data operations do not need a lifecycle abstraction.

## Decision

Create a reusable behavior module when a meaningful UI behavior must be shared
by views or components and depends on framework state, lifecycle, reactive
inputs, or side effects. In Vue, implement this as a composable using the
Composition API.

## Rules

- A reusable behavior module MUST have one clear state, lifecycle, or side-effect responsibility.
- Its name SHOULD follow the framework's convention. Vue composables commonly use the `use` prefix, such as `useFetch`, `usePagination`, or `useForm`.
- A reusable behavior module MAY own framework state, derived values, subscriptions, lifecycle hooks, loading/error state, refresh behavior, cancellation, or reactive parameters.
- It MUST NOT contain business rules, API/model mapping, or substantial data transformations that can operate independently from the UI framework.
- It MUST NOT be created merely to rename a stateless helper or move arbitrary reusable code into another file.
- Logic used once and not meaningfully reusable SHOULD remain in its view or component.
- A reusable behavior module SHOULD normally create state when called so each consumer receives an independent instance.
- State that must be shared across independent views MUST be owned by an explicit shared store rather than hidden in module-level behavior state.
- A reusable behavior module MAY call a business service for API communication or business/data operations.
- It SHOULD remain usable by a view or component without exposing service implementation details.

## Classification Decision Tree

```text
Does the logic require framework state, lifecycle, or reactive inputs?
|
+-- NO -> Is it business/data logic or a stateless reusable function?
|          |
|          +-- Business/data logic -> Use a business service.
|          `-- Stateless function -> Use a normal utility.
|
`-- YES -> Is the same reactive behavior reused by views or components?
           |
           +-- NO -> Keep it local to the view or component.
          `-- YES -> Create a focused reusable behavior module (a Vue composable in Vue).
```

## Vue Example

A reusable pagination behavior is a composable because it owns reactive page state and derived values:

```ts
import { computed, ref } from 'vue'

export function usePagination(totalItems: () => number, pageSize: number) {
  const page = ref(1)
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(totalItems() / pageSize)),
  )

  function nextPage() {
    page.value = Math.min(page.value + 1, pageCount.value)
  }

  return { page, pageCount, nextPage }
}
```

A currency formatter does not need Vue and remains a normal utility:

```ts
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} EUR`
}
```

## Rationale

This boundary keeps framework-aware behavior reusable without turning every
function into a lifecycle abstraction or coupling business logic to UI state.

## Consequences

- Composable extraction requires a genuine reactive or lifecycle responsibility.
- Local behavior may remain in a component until reuse or complexity justifies extraction.
- Business services and composables often work together, but they remain independently owned.

## References

- [Choose between a service and a composable](002-composable-or-service-decision-tree.md)
- [Services management](../services-management/README.md)
- [State and reactivity management](../reactivity-management/README.md)
