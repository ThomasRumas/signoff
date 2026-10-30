# Rule: Enforce the 80% Front-End Statement-Coverage Gate

## Status

Accepted

## Scope

This rule applies only to projects that adopt the 80% statement-coverage
policy. It defines that project's minimum and CI enforcement; the threshold is
not a universal frontend requirement and coverage is not the sole measure of
test quality.

## Decision

Covered frontend application code MUST maintain at least 80% statement coverage. The threshold MUST be enforced automatically by the unit-test command in CI/CD. This rule independently owns the frontend statement-coverage threshold and its enforcement.

## Rules

- The frontend coverage command MUST fail when statement coverage is below 80%.
- CI MUST run unit tests with coverage, enforce the threshold, and build the frontend application.
- A pull request is non-compliant when required unit tests fail, required behavior is untested, or statement coverage falls below 80% for covered code.
- Coverage MUST be combined with behavior-oriented tests for success, failure, edge, state-transition, and interaction scenarios.
- Branch, function, and line coverage MAY be monitored separately, but statement coverage is the mandatory minimum in this rule.
- Coverage exclusions MUST be deliberate, narrow, and documented for generated code, configuration, or code that cannot meaningfully be exercised.
- Tests MUST NOT be added solely to execute statements without asserting meaningful behavior.
- E2E tests do not replace the frontend unit-test coverage gate, and unit coverage does not replace required user-journey E2E tests.

## Example

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
      },
    },
  },
})
```

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

The coverage command exits unsuccessfully when the statement threshold is not met.

## Rationale

An automated minimum prevents coverage drift while keeping behavior assertions as the actual measure of test usefulness.

## Consequences

- Changes that add covered application code may require additional unit or component tests.
- Teams must maintain intentional coverage configuration.
- A passing number does not justify shallow tests or missing E2E journeys.

## Exceptions

A project MAY document a temporary lower threshold for generated, experimental, or otherwise exceptional code. The exception MUST identify the affected scope, reason, owner, and review or expiry condition. The recommended default remains 80% for covered application code.

## References

- [Testing stack and tools](001-testing-stack-and-tools.md)
- [Testing practices and organization](009-testing-practices-and-organization.md)
