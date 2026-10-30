# Rule: Assign State to the Lowest Responsible Owner

## Status

Accepted

## Scope

This rule applies when deciding where frontend state should live. Vue
terminology in the examples illustrates the framework-independent ownership
decision.

## Context

State should be owned by the narrowest scope that can correctly coordinate every consumer. Moving state higher than necessary obscures ownership; keeping state too low duplicates synchronization work.

## Decision

Use this ownership order:

```text
One component only
    -> component-local state

One view and its child components
    -> view-owned state

One component tree with deep descendants
    -> framework context/provider mechanism when appropriate

Multiple independent views
    -> consider a shared state store
```

Sharing state between siblings in one view does not, by itself, justify a
global store. The view should normally own the state and pass the required data
and events to its children. In Vue, Pinia is one implementation option for
state shared across independent views.

## Decision Tree

```text
Who needs this reactive state?
|
+-- One component only?
|     +-- YES -> Keep it in that component with local framework state.
|     `-- NO
|
+-- One view and its children?
|     +-- YES -> Keep it in the view and communicate with children explicitly.
|     `-- NO
|
+-- One component tree with deep descendants?
|     +-- YES -> Consider the framework's context/provider mechanism with a clear local owner.
|     `-- NO
|
+-- Multiple independent views?
|     +-- YES -> Continue to the shared-store decision rule.
|     `-- NO  -> Keep it at the narrowest owner already identified.
```

## Rules

- State MUST live at the lowest level that can coordinate all of its consumers.
- Sibling components in the same view SHOULD share state through their view owner rather than a global store.
- A view SHOULD pass state and events through component interfaces before introducing global state.
- A context/provider mechanism SHOULD be limited to a related component tree and MUST have an explicit owner. In Vue, `provide`/`inject` is one option.
- A shared store MUST NOT replace normal parent/child state management.
- When independent views need synchronized state, apply [the shared-store decision](./003-when-to-use-a-pinia-store.md).
- When a state owner calls a service, the service MUST return data and MUST NOT own framework UI state. See [the service boundary rule](./006-store-service-responsibilities.md).

## Example

```text
OrdersView
  |
    +-- orders = local state
    +-- selectedOrderId = local state
  |
  +-- OrderList     <- props: orders, selectedOrderId
  `-- OrderDetails  <- props: selectedOrder
```

If `OrderList` and `OrderDetails` belong to the same view, `OrdersView` is the
natural state owner. A store is unnecessary unless another independent view
also needs synchronized order state. A Vue implementation may use `ref` for
the local values shown here.

## Rationale

The lowest responsible owner minimizes the number of consumers that must understand the state and keeps synchronization local. Escalation becomes intentional instead of being driven by convenience.

## Consequences

- State ownership is visible in the component tree.
- Sibling communication remains explicit.
- Deep trees may need `provide`/`inject` or a composable to avoid excessive prop passing.
- Independent-view synchronization can justify a store and its additional lifecycle responsibility.
