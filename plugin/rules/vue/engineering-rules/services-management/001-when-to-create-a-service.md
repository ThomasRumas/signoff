# Rule: Create Services Around Meaningful Responsibilities

## Status

Accepted

## Scope

This rule applies when deciding whether reusable frontend logic should become
a standalone service rather than remain in a view, component, reactive
behavior module, or store. Vue terminology in examples is illustrative.

## Context

Reusable business logic often starts inside a view or component. Leaving it there duplicates behavior and couples business decisions to the UI. Creating a service for every reusable function, however, produces abstractions without a meaningful owner.

## Decision

Create a standalone service when logic represents a coherent business or application responsibility that is independent from a specific view or component and may be reused by multiple parts of the application.

A service may own:

- Business rules independent from UI framework state.
- API communication through the application's client boundary.
- Frontend-to-API and API-to-frontend transformations.
- Coordination of a business workflow.
- Calculations that belong to a named business domain.
- Data preparation required by multiple views, components, stores, or services.

The service organization MUST reflect business responsibilities or domains rather than technical operations.

## Decision Tree

```text
Does the logic represent a meaningful business or application responsibility?
|
+-- NO -> Keep it local or use a small focused helper.
|
`-- YES
      |
      Is it owned by one specific component?
      |
      +-- YES -> Keep it with the business component service.
      `-- NO
            |
            Is it owned by one specific view only?
            |
            +-- YES -> Keep it in the view or its supporting composable.
            `-- NO
                  |
                  Is it reusable across views, components, stores, or services?
                  |
                  +-- YES -> Create a standalone service around that responsibility.
                  `-- NO  -> Keep it local until a real shared boundary exists.
```

## Rules

- A standalone service MUST have a named responsibility and a clear owner.
- A service SHOULD be independent from the existence of a particular view or component.
- A service SHOULD be created when several consumers need the same business operation, data transformation, or workflow.
- A service MUST NOT be created solely because a function could theoretically be reused.
- A service MUST NOT be created solely to move a few lines of trivial code into another file.
- Logic specific to one business component SHOULD remain in that component's focused service.
- Logic specific to one view SHOULD remain in the view or a focused reactive behavior module unless it represents an independently meaningful business responsibility.
- A service MUST NOT become a generic container for unrelated API calls, formatting functions, validation helpers, and business operations.
- Service boundaries MUST remain consistent with the [front-end application structure](../../architecture/002-frontend-application-structure.md).

## Examples

### Create a standalone service

An order workflow used by an order view, a checkout component, and an order store is a candidate for `services/orders/order.service.ts`. It has a named business responsibility independent of any one UI consumer.

### Keep logic with a business component

Customer-address validation used only by `CustomerAddressForm` belongs with that business component. If the same validation becomes a shared customer policy, promote it to a customer service with an explicit responsibility.

### Keep a function local

A one-off `calculateTotal(price, quantity)` helper used in one view does not require a service. It may become part of a pricing service when it represents a broader pricing responsibility with multiple consumers.

## Rationale

A meaningful service boundary removes reusable business logic from UI code without turning the codebase into a collection of arbitrary technical wrappers.

## Consequences

- Reusable responsibilities have explicit names and owners.
- Views and components remain focused on UI composition and orchestration.
- Small logic stays simple when no independent boundary is needed.
- Service extraction requires judgment about ownership and reuse.
