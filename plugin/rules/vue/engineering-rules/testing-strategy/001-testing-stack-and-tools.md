# Rule: Choose Testing Tools by Boundary

## Status

Accepted

## Scope

This rule applies to unit, component, and end-to-end testing in frontend
applications. Tool names in this document use Vue as the example; select the
equivalent tools for the target framework and project.

## Context

Each test tool validates a different boundary. Using E2E tests for isolated business logic makes feedback slow, while using unit tests to prove a complete view journey leaves routing and integration gaps.

## Decision

Choose the test tool that exercises the boundary under test. For example, a
Vue project may use Vitest for unit tests, Vue Test Utils for mounted component
tests, Pinia testing support for stores, and its selected browser runner for
end-to-end tests.

## Rules

- Unit tests MUST exercise isolated logic with controlled dependencies. In Vue/TypeScript projects, Vitest is one suitable runner.
- Services MUST be tested without rendering the UI or mounting a framework application.
- Shared stores MUST be tested through their public state and operations. In Vue, Pinia testing support is one suitable setup.
- UI components SHOULD be tested with the target framework's public component-testing tools. In Vue, Vue Test Utils can verify rendering, interaction, reactive changes, and service coordination.
- UI components do not require project-level unit tests by default; the exception boundary is defined in [004-ui-components-and-unit-testing.md](004-ui-components-and-unit-testing.md).
- Reusable behavior modules with meaningful reactive or lifecycle behavior MUST be tested at their public state and side-effect boundary. In Vue, Vue Test Utils MAY provide a lifecycle scope.
- Critical user journeys SHOULD be tested with the project's selected browser runner against a real running application. Playwright is the example used in [the E2E rule](006-playwright-e2e-views.md).
- Shared fixture packages MUST be used only when the project adopts that policy; see [007-shared-playwright-fixtures.md](007-shared-playwright-fixtures.md).
- End-to-end tests MUST NOT replace unit tests for services, stores, reusable behavior modules, or business-component behavior.
- Test code MUST use the same public APIs that production code uses. Private implementation details MUST NOT be the main test contract.

## Test Boundary Decision Tree

```text
What behavior is being verified?
|
+-- A pure function, service, mapper, validator, or business rule?
|     `-- Unit test with the project's runner (Vue example: Vitest).
|
+-- Shared state or store operation?
|     `-- Store test with controlled service dependencies (Vue example: Pinia).
|
+-- Reusable stateful or lifecycle behavior?
|     `-- Behavior-module test; use a framework harness only when lifecycle needs a scope.
|
+-- Component rendering or interaction?
|     `-- Component test with the framework's public testing tool (Vue example: Vue Test Utils).
|
+-- View navigation or a cross-page user journey?
|     `-- Project-selected browser E2E runner (Playwright example).
|
`-- A presentational UI component with no project-specific behavior?
      `-- No project-level unit-test suite by default.
```

## Rationale

Matching the tool to the behavior keeps tests fast and makes failures attributable to the correct architectural boundary.

## Consequences

- The same feature may have unit, component, and E2E tests with different responsibilities.
- Business components require component mounting (Vue Test Utils in Vue projects) because their behavior includes UI rendering and interaction.
- E2E setup requires a running application, environment configuration, and CI artifact handling.

## References

- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [Pinia testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Playwright](https://playwright.dev/)
- [Shared Playwright fixtures policy](007-shared-playwright-fixtures.md)
