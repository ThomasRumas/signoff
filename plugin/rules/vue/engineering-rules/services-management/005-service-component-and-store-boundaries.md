# Rule: Separate Services, Business Components, and Stores

## Status

Accepted

## Scope

This rule applies when the same feature could be implemented in a component
service, a standalone service, or a shared state store. Vue business components
and Pinia in examples illustrate these framework-neutral roles.

## Context

Business component services, standalone services, and Pinia stores can all be involved in a feature, but they own different boundaries. Choosing the wrong owner creates duplicated workflows, global state without need, or services coupled to one UI.

## Decision

Use the following ownership model:

| Responsibility | Owner |
| --- | --- |
| UI rendering and user interaction | View or component |
| UI state and component-local state | View, component, or framework reactive behavior module |
| Business logic specific to one business component | Business component service |
| Reusable business logic independent from one UI consumer | Standalone service |
| Shared state across independent views | Shared state store |
| Shared state lifecycle and request coordination | Shared state store |
| API communication, mapping, and non-reactive transformations | Service |

## Decision Tree

```text
Where does the responsibility belong?
|
+-- Rendering, interaction, or component-local UI state?
|     `-- View, component, or composable
|
+-- Business/data logic used only by one business component?
|     `-- Business component service
|
+-- Business/data logic reusable by multiple consumers?
|     `-- Standalone service
|
+-- State synchronized across independent views?
|     `-- Shared store, usually consuming a service
|
`-- None of these?
      `-- Keep the logic local until a meaningful responsibility exists.
```

## Rules

- A business component service MUST remain focused on the business component it supports.
- A standalone service MUST NOT be created merely to share one method from a component service; promote the responsibility only when it has an independent business owner.
- A shared store MUST own shared state and its lifecycle, not the service's API mapping or business rules.
- A store SHOULD consume a service rather than duplicate its API communication and transformation logic.
- A service MUST NOT become a substitute for a store by exposing framework-owned reactive state.
- A view or component MUST NOT become a substitute for a reusable service by embedding shared business workflows.
- When a responsibility moves from one owner to another, remove the duplicated implementation and update the affected consumers.
- Apply the [component management rules](../components-management/README.md) and [reactivity management rules](../reactivity-management/README.md) together with this rule.

## Example

```text
OrdersView
    |
    v
OrdersStore       Shared orders and request lifecycle
    |
    v
OrderService      API calls, mapping, validation, business operations
    |
    v
Application API
```

If only `OrdersView` needs orders, omit the store:

```text
OrdersView
    |
    v
OrderService      API calls and mapping
    |
    v
Application API
```

## Rationale

Explicit ownership avoids global state for local workflows, keeps shared state reactive, and gives reusable business/data operations a stable non-reactive boundary.

## Consequences

- Features may use multiple layers when each layer has a real responsibility.
- Simple local features can avoid both stores and standalone services.
- Store and service APIs must be designed together for shared data.
- Moving logic across boundaries can require coordinated consumer changes.
