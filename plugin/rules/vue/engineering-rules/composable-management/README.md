# Reusable Reactive Behavior Rules

These rules define when frontend behavior should be reusable, how it owns
state and lifecycle, and how it relates to services and shared stores. The
decisions apply across frameworks. Vue composables are used as concrete
examples of reusable reactive behavior.

## Status

Accepted

## Rules

1. [Create reusable behavior around meaningful responsibilities](001-when-to-create-a-composable.md) defines when behavior extraction is useful and how it differs from local logic.
2. [Choose between a service and reactive behavior](002-composable-or-service-decision-tree.md) defines the decision tree for selecting the correct abstraction.
3. [Keep behavior state scoped and inputs reactive](003-composable-state-and-reactive-inputs.md) defines instance scope, reactive inputs, and escalation to shared state.
4. [Compose lifecycle and reactive behavior](004-composable-lifecycle-and-composition.md) defines side-effect ownership, cleanup, and composition.
5. [Use explicit reusable-behavior APIs](005-composable-apis-and-conventions.md) defines naming, return values, fetching boundaries, and stateless utilities.
6. [Test reusable behavior at its public boundary](006-composable-testing-and-anti-patterns.md) defines tests and the main service, store, and behavior-module anti-patterns.

## Core Principle

A reusable reactive behavior module owns framework-dependent state, lifecycle,
and side effects. In Vue, this is commonly a composable using refs, computed
values, watchers, and lifecycle hooks. It MUST NOT replace a service or a
shared state store.

## Architecture at a Glance

```text
View or business component
        |
        +--> Local framework state
        |
        +--> Reusable reactive behavior (Vue: composable)
        |       reactive behavior, lifecycle, side effects
        |              |
        |              v
        |        Business service
        |              business rules, API, mapping
        |              |
        |              v
        |             API
        |
        `--> Shared store (Vue: Pinia)
                shared reactive state and lifecycle
                         |
                         v
                   Business service
```

## Related Rules

- [Frontend application structure](../../architecture/002-frontend-application-structure.md)
- [Reactivity management](../reactivity-management/README.md)
- [Services management](../services-management/README.md)
- [Testing strategy](../testing-strategy/README.md)
- [Component services, reactivity, and testability](../components-management/003-component-services-reactivity-and-testability.md)

## Vue Examples

- [Vue composables](https://vuejs.org/guide/reusability/composables.html)
- [Vue computed properties](https://vuejs.org/guide/essentials/computed.html)
- [Vue watchers](https://vuejs.org/guide/essentials/watchers.html)
