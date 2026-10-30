# Rule: Do Not Require Unit Tests for UI Components by Default

## Status

Accepted

## Scope

This rule applies to presentational UI components, design-system consumers, and
small reusable components that do not own business-specific behavior.

## Context

UI components primarily render props, slots, and emitted events. Requiring a project-level unit-test suite for every UI component duplicates confidence provided by the design system and creates maintenance work without protecting a business rule.

This exclusion does not apply to a component that owns business behavior. Classification is based on responsibility, not on whether the component contains a template.

## Decision

UI components MUST NOT require project-level unit-test suites by default. Business components remain subject to [003-unit-testing-business-components.md](003-unit-testing-business-components.md).

## Rules

- A UI component SHOULD remain presentational and delegate business decisions to its consumer or an appropriate service.
- Approved design-system component internals MUST NOT be re-tested by each consuming application.
- A project-owned UI component MAY receive a focused unit test when it contains custom accessibility behavior, non-trivial keyboard interaction, stateful behavior, an adapter around an external component, or another meaningful project-specific contract.
- Any exception MUST identify the behavior being protected and MUST remain limited to that behavior.
- A UI component MUST NOT receive a unit-test suite solely to increase coverage numbers.
- A component that owns business rules, API coordination, workflow state, or meaningful domain behavior MUST be classified as a business component and tested under [003-unit-testing-business-components.md](003-unit-testing-business-components.md).
- View E2E tests MAY cover the composition of UI components in a real user journey, but E2E coverage does not require testing every visual variant.
- Visual regression, accessibility, or design-system validation MAY be provided by a shared platform or design-system pipeline rather than duplicated in every application.

## Classification Decision Tree

```text
Does the component own business rules, API coordination, or domain workflow behavior?
|
+-- YES -> Classify it as a business component and unit-test UI plus service behavior.
|
`-- NO
      |
      Does it contain meaningful project-specific behavior beyond rendering props/slots?
      |
      +-- YES -> Add a narrow focused test for that behavior when justified.
      `-- NO  -> No project-level unit-test suite is required.
```

## Example

A `BaseButton` that forwards `disabled`, renders a slot, and emits `click` does not need a project-level unit-test suite when it is a thin consumer of the approved design system.

A `FilterMenu` that implements custom keyboard navigation and focus restoration MAY have focused tests for those behaviors. It does not need tests for the underlying design-system menu implementation.

## Rationale

This rule directs testing effort toward business behavior and genuinely custom UI contracts while relying on the design system for the behavior it already owns.

## Consequences

- The application avoids broad low-value component-test suites.
- Classification must be revisited when a presentational component gains business behavior.
- Exceptions need clear scope so the default does not expand accidentally.

## References

- [Component management](../components-management/README.md)
- [Design-system component rule](../components-management/004-ui-components-and-design-system.md)
- [003-unit-testing-business-components.md](003-unit-testing-business-components.md)
