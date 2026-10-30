# Rule: Reuse Shared Playwright Fixtures for Front-End E2E

## Status

Accepted

## Scope

This rule applies only to frontend projects that adopt a shared Playwright
fixture package, such as an internal testkit maintained for several
applications. It is optional context, not a Vue or universal frontend
requirement.

## Decision

When a project adopts a shared Playwright fixture package, frontend Playwright
suites MUST use that package through its documented public entrypoints. The
package's documentation defines its runtime and public API requirements.

## Rules

- Frontend E2E projects MUST declare the shared fixture package as a dependency and MUST follow the runtime and version requirements of the consumed package.
- Tests MUST import only the package's documented public entrypoints, such as its fixtures and reporter subpaths, never internal files.
- Frontend suites SHOULD compose the shared fixtures with Playwright's `mergeTests` rather than copying fixture code.
- Authentication MUST be centralized in the shared or project fixture. Individual view journeys MUST consume the authenticated context or fixture and MUST NOT repeat login or credential-handling logic.
- Credentials and tokens MUST come from environment or CI secret stores and MUST NOT be hard-coded in tests or written to reports.
- When traces or attachments are enabled, configure the package's redaction reporter, if it provides one, before other reporters.
- Frontend projects MUST NOT fork or locally reimplement shared fixtures or reporters without a documented exception naming the missing capability, owner, maintenance plan, and review date.
- Shared fixtures do not remove the requirement to test frontend-specific view journeys; they provide setup while the suite protects application behavior.

## Example

```ts
import { expect, mergeTests, test as playwrightTest } from '@playwright/test'
import { test as sharedTest } from '@acme/playwright-fixtures/fixtures'

export const test = mergeTests(playwrightTest, sharedTest)
export { expect }

test('authenticated user can open the account view', async ({ page }) => {
  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible()
})
```

`@acme/playwright-fixtures` is a placeholder for the adopted package. The project composes its public fixture entrypoint, and authentication setup remains in the fixture rather than in the journey.

## Exceptions

A project MAY request an exception for a documented platform incompatibility, missing capability, or transition from an existing suite. The exception MUST identify the affected frontend E2E capability, explain why the shared package cannot be used, name an owner, and define a review date.

## Consequences

Frontend E2E suites receive consistent authentication, data setup, redaction, and reporting behavior. They must follow the package's supported runtime and public API requirements.

## References

- [Playwright E2E views](006-playwright-e2e-views.md)
- [E2E CI and PR protection](010-e2e-ci-and-pr-protection.md)
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright mergeTests](https://playwright.dev/docs/test-fixtures#combine-custom-fixtures-from-multiple-modules)
