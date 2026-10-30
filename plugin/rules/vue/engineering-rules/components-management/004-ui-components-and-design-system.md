# Rule: Create UI Components Through the Design System

## Status

Accepted

## Scope

This rule applies to reusable visual and interaction components across
frontend frameworks. shadcn/ui and shadcn-vue are optional references, not
required dependencies.

## Context

A UI component should provide a stable visual or interaction pattern, not
become a second home for business workflows. Creating custom UI components
when the project's design system already provides the required pattern creates
inconsistent behavior, styling, and accessibility expectations.

## Decision

Use the application's established design system as the default source of UI
components. When choosing shadcn as a component foundation, use shadcn/ui for
React and shadcn-vue for Vue. These projects provide customizable component
code to build on; they are references and options, not mandatory application
dependencies. Other frameworks SHOULD use a compatible design system chosen by
the project.

Create a custom reusable UI component only when:

1. The design system does not provide the required visual or interaction pattern; or
2. The application repeatedly uses a focused composition of design-system components and the composition itself is a meaningful reusable pattern.

## Rules

- When the project has a design system, developers MUST check its available components before creating a custom UI component.
- A design-system implementation MUST match the application's framework. Vue applications choosing shadcn SHOULD use shadcn-vue rather than the React-oriented shadcn/ui implementation.
- A custom UI component MUST remain focused on visual composition and UI behavior.
- A UI component MUST NOT contain unrelated business workflows, business data access, or domain orchestration.
- A reusable composition MAY combine several design-system components when it is used across multiple views or represents a stable application-wide pattern.
- A custom UI component SHOULD expose a small, explicit interface through props, emits, and slots.
- A custom UI component SHOULD preserve the design system's accessibility, interaction, and visual conventions.
- A UI component that acquires an autonomous business responsibility MUST be reconsidered as a business component and follow [the business component structure rule](./002-business-component-structure.md).
- A component that is used once and has no meaningful independent responsibility SHOULD remain local to its view or parent.
- Do not create a wrapper component that only renames or forwards an existing design-system component without adding a stable application-level responsibility.
- UI components MAY use composables for reusable UI behavior, but they MUST keep business/data ownership in the appropriate service, store, or business component boundary.

## Examples

### Use the design system directly

Use the project's design-system button, input, select, alert, modal, or tabs
component when it provides the required behavior and appearance. Do not create
an application wrapper solely to change its name.

### Create a reusable composition

```text
Design system:
  Input
  Select
  Button
  Alert

Application:
  CustomerSearchForm
    Input
    Select
    Button
    Alert
```

`CustomerSearchForm` is justified as a UI component when the same composition is used repeatedly and its interface represents a stable visual workflow. It should not silently acquire customer search business rules or API orchestration.

### Keep one-off markup local

A single view's card-like grouping or one-off form layout should remain in the view when it is not reused and does not define an independent interaction pattern.

## Rationale

The project's design system provides tested and consistent primitives.
Requiring a real application need before creating custom UI keeps the
component catalogue understandable and prevents visual and accessibility
drift.

## Consequences

- Applications receive consistent UI behavior and styling by default.
- Custom components require a clear reason and a focused interface.
- Some view-specific markup remains local instead of being abstracted prematurely.
- Repeated compositions can be centralized without mixing visual concerns with business logic.

## Exceptions

A custom UI component MAY be created for a product-specific interaction that the design system cannot express. The change SHOULD document the missing design-system capability and the component's intended reuse or ownership.

## References

- [shadcn/ui](https://ui.shadcn.com/) - customizable component foundation for React projects.
- [shadcn-vue](https://www.shadcn-vue.com/) - Vue implementation of the shadcn approach.
