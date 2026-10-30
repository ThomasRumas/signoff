# Rule: Use a Store for Genuinely Shared State

## Status

Accepted

## Scope

This rule applies when deciding whether state should be promoted from a local
component or view owner to a shared store. The decision applies across
frameworks; Pinia is the Vue example used here.

## Context

A shared store provides one stable state owner for independent consumers. It
is not a default container for every API resource or a replacement for
ordinary component communication.

## Decision

Create a shared store only when state must be synchronized across independent
parts of the application or its lifecycle must survive navigation beyond its
current component tree. Do not introduce a store solely because state comes
from an API, is large, or is convenient to access globally. In Vue, Pinia is
one implementation option.

## Valid Store Scenarios

- Authentication and current-user state consumed by the application shell, navigation, and multiple views.
- A multi-step workflow whose state must survive navigation between steps.
- Business data that independent views must update and observe together.
- Shared state with a lifecycle that cannot reasonably be owned by one view.

## Decision Tree

```text
Does more than one independent view need this reactive state?
|
+-- NO -> Keep it local to the component or view.
|
`-- YES
      |
      +-- Can one view or one component tree own and coordinate it?
      |     +-- YES -> Keep it local to that owner.
      |     `-- NO  -> A shared store is justified.
      |
      `-- Is the need only caused by API data, state size, or number of calls?
            +-- YES -> Do not create a store for that reason alone.
            `-- NO  -> Document the shared lifecycle and use a store when needed.
```

## Rules

- A store MUST have a named responsibility and a defined set of consumers.
- A store MUST NOT be created solely because data comes from an API.
- A store MUST NOT be created solely because a view has many fields or makes many requests.
- Authentication, multi-view workflows, and cross-view synchronization are valid reasons when the state genuinely crosses independent view boundaries.
- A store SHOULD expose state and actions that represent its responsibility rather than becoming a generic application bucket.
- A store SHOULD delegate API communication, mapping, and business operations to a focused service. See [the store/service responsibility rule](./006-store-service-responsibilities.md).
- A store MUST NOT be used to hide state that belongs to one view and its children.

## Example

```text
Application shell ----+
                      |
Dashboard view -------+--> Authentication store
                      |        |
User view ------------+        +-- current user
                               +-- authentication status
                               `-- permissions
```

Authentication is a valid store responsibility because unrelated parts of the application need the same reactive session state.

By contrast, orders used only by `OrdersView` should remain in that view or its business component and use a service directly.

## Rationale

A store is valuable when it coordinates genuinely shared state. Restricting it
to that role keeps global state understandable and avoids stores that become
unbounded caches or service locators. A Vue implementation may use Pinia.

## Consequences

- Shared state has a stable owner across independent views.
- Stores introduce an additional lifecycle and public API to maintain.
- Local state remains simpler when cross-view synchronization is not required.
- A store may need explicit refresh, invalidation, or error policies as its responsibility grows.

## Exceptions

A store MAY be introduced for another shared lifecycle when the requirement is documented and cannot be handled cleanly by a view, composable, or local component tree. The store's consumers and lifecycle MUST be explicit.
