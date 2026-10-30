# Rule: Test Views Through Playwright User Journeys

## Status

Accepted

## Scope

This rule applies to frontend user journeys that cross navigation, UI
components, integrations, and the running application. Its Playwright example
uses Vue; projects may use their selected browser test runner.

## Context

A view is an application composition boundary. Its important behavior includes navigation, route guards, page-level loading, business-component composition, authentication, and recovery from API failures. These concerns cannot be proven completely by isolated component tests.

## Decision

Critical frontend user journeys SHOULD have end-to-end coverage using the
project's selected runner. Tests MUST exercise the application through a real
running frontend and its configured integration boundary.

## Rules

- Each business-critical view SHOULD have at least one Playwright journey covering its primary successful workflow.
- Journeys SHOULD cover meaningful failure or recovery paths when the view exposes them, such as authentication failure, empty results, validation errors, or API unavailability.
- E2E tests MUST use user-visible behavior, accessible locators, navigation, and submitted interactions rather than private Vue methods or component internals.
- E2E tests MUST verify the outcome that protects the user journey, not every visual detail already covered by component or design-system tests.
- Tests MUST run against a real built or deployed frontend with the required application dependencies ready.
- E2E tests MUST use isolated or controlled test data and MUST NOT depend on a developer's personal account or local machine state.
- Authentication MUST use the project's documented fixture and secret-handling conventions. Projects MAY adopt the [shared Playwright fixtures policy](007-shared-playwright-fixtures.md).
- A view test MUST NOT replace unit tests for the services, stores, composables, or business components used by that view.
- E2E tests SHOULD be organized by user journey or business capability rather than by implementation file.
- Flaky tests MUST be investigated and corrected; retries MUST NOT conceal a broken user journey.

## Journey Decision Tree

```text
Does the change affect navigation, view composition, or a business-critical user journey?
|
+-- YES -> Add or update an E2E journey with the project's selected runner.
|
`-- NO
      |
      Is the change isolated to a service, store, composable, or business component?
      |
      +-- YES -> Add the focused unit/component test; update E2E only if the journey changes.
      `-- NO  -> Select the smallest test boundary that proves the behavior.
```

## Playwright Example (Vue)

```ts
import { expect } from '@playwright/test'
import { test } from './fixtures'

test('customer can create an order', async ({ page }) => {
  await page.goto('/orders/new')
  await page.getByLabel('Product').selectOption('product-1')
  await page.getByLabel('Quantity').fill('2')
  await page.getByRole('button', { name: 'Create order' }).click()

  await expect(page.getByRole('status')).toHaveText('Order created')
  await expect(page).toHaveURL(/\/orders\/[^/]+$/)
})
```

The test protects navigation, view composition, form interaction, API integration, and the visible result as one user journey.

## Rationale

Playwright provides confidence at the boundary users experience. Keeping journeys focused prevents a large E2E suite from duplicating every unit assertion while still protecting critical flows.

## Consequences

- E2E requires an available, reproducible environment and isolated test data.
- A change to a critical view may require updates to both focused tests and journeys.
- Failures can involve several application layers and need useful CI artifacts for diagnosis.

## References

- [Shared Playwright fixtures](007-shared-playwright-fixtures.md)
- [E2E CI and PR protection](010-e2e-ci-and-pr-protection.md)
