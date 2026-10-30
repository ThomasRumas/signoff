# Rule: Keep Front-End Tests Focused and Behavior-Oriented

## Status

Accepted

## Scope

This rule applies to frontend unit, component, shared-state, reusable behavior,
and end-to-end tests. Framework names in examples are illustrative.

## Decision

Tests MUST describe and assert behavior at the boundary they own. Tests SHOULD be colocated with implementation or follow an explicitly documented equivalent organization.

## Rules

- Tests MUST assert meaningful outcomes, state transitions, emitted events, visible behavior, or relevant dependency interactions.
- Tests SHOULD cover successful behavior and the meaningful failure, empty, boundary, and recovery cases owned by the unit under test.
- Unit tests MUST isolate external dependencies such as API clients, browser transport, storage, timers, and analytics adapters.
- Tests MUST NOT depend on real developer credentials, personal accounts, uncontrolled time, or external infrastructure unless they are explicitly E2E tests in a controlled environment.
- Component tests SHOULD use accessible queries, public props, emitted events, slots, and visible results instead of private methods or implementation-specific structure.
- Service and store tests SHOULD use explicit fixtures and reset mocks/state between tests.
- Tests MUST remain deterministic. Retries, arbitrary delays, and broad sleeps MUST NOT be used to hide timing or synchronization defects.
- Test names SHOULD describe the behavior and relevant scenario, not the implementation method being called.
- Unit and component tests SHOULD be colocated with the implementation, while end-to-end tests SHOULD be grouped by user journey or business capability. Playwright is one example of an E2E runner.
- Shared test helpers MUST have a clear responsibility and MUST NOT hide the behavior being asserted.
- When a test requires broad setup or unrelated mocks, reconsider whether the unit has too many responsibilities.
- A test suite MUST be updated when a public behavior changes; deleting a failing test without replacing its protection is not an acceptable fix.

## Test Boundary Decision Tree

```text
What behavior failed or changed?
|
+-- Service, mapping, validation, or non-reactive business behavior?
|     `-- Update the isolated service unit test.
|
+-- Store state, action, request coordination, or reset behavior?
|     `-- Update the store unit test.
|
+-- Reusable behavior state, lifecycle, or cleanup?
|     `-- Update the behavior-module unit test.
|
+-- Business-component rendering or interaction?
|     `-- Update the component test using the framework's public API.
|
+-- View navigation or a cross-component user journey?
|     `-- Update the project's end-to-end journey.
|
`-- A thin UI component with no custom behavior?
      `-- No project-level unit test is required by default.
```

## Vue Example

```ts
it('shows the service error to the user', async () => {
  vi.mocked(loadCustomer).mockRejectedValue(new Error('Request failed'))
  const wrapper = mount(CustomerCard, {
    props: { customerId: 'customer-1' },
  })

  await wrapper.get('button').trigger('click')

  expect(wrapper.get('[role="alert"]').text()).toContain('Request failed')
})
```

The assertion targets the component's user-visible contract. The service test separately verifies how the service handles API failures.

## Rationale

Focused behavior tests are easier to understand, faster to run, and more useful
when a change breaks a specific responsibility.

## Consequences

- Some behaviors are intentionally tested at more than one boundary.
- Test setup must remain explicit enough to explain the scenario.
- Flaky tests require maintenance rather than permanent retries or skipped execution.

## References

- [Testing stack and tools](001-testing-stack-and-tools.md)
- [Business-component tests](003-unit-testing-business-components.md)
- [UI-component testing policy](004-ui-components-and-unit-testing.md)
- [Playwright E2E views](006-playwright-e2e-views.md)
