# Rule: Require Front-End E2E Before Every Pull Request Merge

## Status

Accepted

## Scope

This rule applies only when a project adopts a mandatory every-pull-request
frontend E2E gate. It describes Playwright execution, readiness, reports,
artifacts, and merge protection; it is not a universal frontend requirement.

## Context

Views and user journeys depend on a running frontend, routing, authentication, and application APIs. A suite that runs only on developer machines or after merging cannot reliably protect the user experience.

## Decision

Frontend Playwright E2E tests MUST run in CI before every pull request is merged. The E2E job MUST be a required protected status check, and a failing or missing E2E result MUST prevent the merge.

The pipeline MUST build or deploy the frontend and its required application dependencies, wait for readiness, run the configured Playwright suite with the project's adopted fixtures, and publish actionable results.

## Rules

- Every pull request that changes frontend application code, configuration, dependencies, views, components, stores, services, or composables MUST be covered by the frontend E2E CI gate before merge.
- The pipeline MUST install dependencies reproducibly from the lockfile and MUST use the supported Node and browser runtime for the project and its fixture packages.
- CI MUST build or deploy the frontend and required API dependencies before invoking Playwright.
- CI MUST perform an explicit readiness check before running the E2E suite.
- The E2E job MUST fail when any required Playwright test fails, times out, cannot start, or produces no result.
- Repository branch protection MUST require the E2E job for pull-request merge. A reviewer MUST NOT override a missing result by treating the check as optional.
- The same configured user journeys MUST run locally and in CI; CI-only skipping is prohibited.
- E2E target URLs, credentials, and environment configuration MUST come from CI configuration and approved secret stores.
- CI MUST publish Playwright reports and test results. Screenshots, traces, videos, and logs SHOULD be retained when they help diagnose failures.
- An attachment-redaction reporter, when the project uses one, MUST run before other reporters when traces or sensitive attachments are enabled.
- The pipeline MUST clean up ephemeral environments and test data even when E2E fails.
- Shared environments MAY be used only with documented data isolation, concurrency controls, cleanup, and residual risk.
- E2E parallelism MAY be increased only after test-data isolation and environment capacity are demonstrated.

## Execution Flow

```text
Pull request opened or updated
          |
          v
Install locked dependencies and build frontend/application
          |
          v
Start or deploy isolated test environment
          |
          v
Readiness check
          |
          v
Playwright E2E suite
          |
          +-- FAIL -> Publish artifacts and block merge
          |
          `-- PASS -> Publish results and allow protected merge checks to continue
```

## Example

```sh
npm ci
npm run build
npm run start:test &
npx wait-on "$E2E_BASE_URL/health"
E2E_BASE_URL="$E2E_BASE_URL" npx playwright test
```

The CI job must be configured as a required pull-request status check. A successful command alone is insufficient if branch protection does not require its result.

## Rationale

Running E2E before every merge catches broken user journeys while the change is still reviewable. Required status protection makes the policy enforceable rather than dependent on manual reviewer discipline.

## Consequences

- Pull requests need a reproducible environment and enough CI capacity for the E2E suite.
- E2E failures can block merging and require investigation or a documented exception.
- Reports and artifacts add storage and pipeline configuration requirements.

## Exceptions

A project MAY exclude a scenario from the mandatory gate when it depends on unavailable infrastructure, has a documented destructive impact, or is intentionally scheduled outside the merge workflow. The exception MUST name the affected journey, replacement validation, owner, residual risk, and review date.

An exception MUST NOT make the entire frontend E2E gate optional for ordinary pull requests.

## References

- [Playwright E2E views](006-playwright-e2e-views.md)
- [Shared Playwright fixtures](007-shared-playwright-fixtures.md)
