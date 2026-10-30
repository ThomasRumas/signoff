# Frontend Testing Strategy

These rules define framework-neutral test boundaries and behavior expectations.
Vue tooling appears as a concrete example. Select runners, coverage thresholds,
fixtures, and CI merge gates according to the project's adopted policy.

## Decision

Tests MUST follow responsibility ownership:

- Business components MUST have both UI behavior tests (Vue component tests in Vue projects) and component service unit tests.
- UI components do not require project-level unit tests by default.
- Stores, services, and composables with meaningful behavior MUST have unit tests.
- Critical user journeys SHOULD have end-to-end coverage using the project's
	selected browser test runner.

## Test Levels and Tools

| Test level | Boundary | Standard tools |
| --- | --- | --- |
| Unit | Services and non-reactive business logic | Project's unit runner; Vue example: Vitest |
| Unit | Shared stores and stateful behavior modules | Project's unit runner; Vue example: Vitest |
| Component unit | Component rendering and interaction | Framework component utilities; Vue example: Vue Test Utils |
| End-to-end | Critical user journeys through a real application | Project-selected browser runner; Vue example: Playwright |

End-to-end tools do not replace isolated unit or component tests. Vue Test
Utils is one implementation for Vue component behavior and lifecycle-scoped
reactive modules.

## Rules

1. [001-testing-stack-and-tools.md](001-testing-stack-and-tools.md) defines how to choose unit and component testing tools; it gives Vue examples.
2. [002-unit-testing-services.md](002-unit-testing-services.md) defines isolated service tests, API doubles, mapping, validation, and errors.
3. [003-unit-testing-business-components.md](003-unit-testing-business-components.md) defines tests for business-component UI behavior and component services.
4. [004-ui-components-and-unit-testing.md](004-ui-components-and-unit-testing.md) defines the default exclusion of UI components from project-level unit tests.
5. [005-unit-testing-stores-and-composables.md](005-unit-testing-stores-and-composables.md) defines tests for state owners and reusable reactive behavior; examples use Vue.
6. [006-playwright-e2e-views.md](006-playwright-e2e-views.md) defines the generic user-journey boundary with a Playwright example.
7. [007-shared-playwright-fixtures.md](007-shared-playwright-fixtures.md) is an optional policy for projects that adopt a shared Playwright fixture package.
8. [008-coverage-and-quality-gates.md](008-coverage-and-quality-gates.md) is an optional project 80% statement-coverage policy.
9. [009-testing-practices-and-organization.md](009-testing-practices-and-organization.md) defines behavior assertions, test doubles, placement, and maintenance.
10. [010-e2e-ci-and-pr-protection.md](010-e2e-ci-and-pr-protection.md) defines an optional every-PR E2E merge gate.

## Review Checklist

Before merging a frontend change, verify:

- [ ] Meaningful components, services, state owners, and reusable behavior have focused tests at their public boundaries.
- [ ] UI components do not receive unnecessary project-level unit-test suites.
- [ ] Critical user journeys have end-to-end coverage using the project's selected runner.
- [ ] Unit tests use controlled test doubles for API clients and other external dependencies.
- [ ] Tests assert behavior, including meaningful failure paths, rather than implementation details.
- [ ] Apply coverage thresholds and required CI gates only when the project adopts them.

## Related Rules

- [Front-end application structure](../../architecture/002-frontend-application-structure.md)
- [Component management](../components-management/README.md)
- [Component services, reactivity, and testability](../components-management/003-component-services-reactivity-and-testability.md)
- [Reactivity management](../reactivity-management/README.md)
- [Services management](../services-management/README.md)
- [Service testability and maintenance](../services-management/006-service-testability-and-maintenance.md)
- [Composable management](../composable-management/README.md)
- [E2E CI and pull-request protection](010-e2e-ci-and-pr-protection.md)

## Principle

Use the smallest boundary that proves behavior. Vue tools in these documents
are examples; project-specific thresholds, fixtures, and merge gates are
explicitly identified and are not universal defaults.
