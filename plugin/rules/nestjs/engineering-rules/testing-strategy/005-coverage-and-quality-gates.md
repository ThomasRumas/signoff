# Rule: Enforce the 80% Statement-Coverage Gate

## Status

Accepted

## Scope

This rule applies to NestJS TypeScript API applications. It defines the
recommended default coverage threshold and CI enforcement; it does not define
coverage as the sole measure of test quality.

## Context

Coverage shows which code statements were executed, but it does not prove that
business behavior, edge cases, errors, or important interactions were asserted.
A minimum threshold is still useful as an automated quality gate when it is
combined with behavior-oriented tests.

## Decision

Application code covered by the unit-testing strategy MUST maintain at least
80% statement coverage. The threshold MUST be enforced automatically by the
test command in CI/CD. 80% is a minimum compliance gate, not the objective or
definition of a good test suite.

## Rules

- The test command MUST fail when statement coverage is below 80%.
- CI MUST run at least linting, tests with coverage, threshold enforcement, and
  the application build.
- A pull request is non-compliant when tests fail, required tests are missing,
  or statement coverage falls below 80%.
- Tests MUST also demonstrate meaningful behavior, including happy paths,
  business rules, edge cases, error paths, dependency interactions, and
  reactive flows where applicable.
- Branch, function, and line coverage MAY be monitored and improved
  progressively, but statement coverage is the enforced threshold.
- Coverage reports MUST NOT be used to justify tests that merely execute lines
  without asserting behavior.

## Rationale

Automatic enforcement prevents coverage drift and makes the threshold visible
in every change. Separating the threshold from test quality avoids
rewarding meaningless tests that inflate a number without protecting behavior.

## Alternatives Considered

### Treat 80% coverage as test quality

A suite can execute 80% of statements while missing critical rules and failure
paths. Coverage is evidence of execution, not evidence that behavior is
correct.

### Inspect reports manually

Manual inspection is inconsistent and easy to skip. The test command should
fail automatically when the compliance threshold is not met.

### Require 100% coverage everywhere

Absolute coverage can encourage brittle tests for trivial or generated code.
The recommended default gate is 80%, with higher project-specific requirements
allowed when justified.

## Consequences

Coverage regressions fail early in CI and require teams to add or improve tests.
The threshold adds build work and may require coverage configuration for code
that is intentionally excluded; exclusions MUST be deliberate and documented.

## Exceptions

A project MAY require a higher threshold or temporarily approve a lower
threshold for generated, experimental, or otherwise documented code. The
exception MUST identify the affected scope, reason, owner, and expiry or review
condition. The default remains 80% for covered application code.

## Examples

### Good: enforce the threshold in the test runner

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 80,
      },
    },
  },
});
```

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

The command exits unsuccessfully when the statement threshold is not met.

### Good: combine the gate with behavior tests

```text
Lint
  |
  v
Unit and HTTP Tests with Coverage
  |
  v
Statement Coverage >= 80%
  |
  v
Build
```

The gate measures execution while the tests themselves assert behavior,
errors, and contracts.

### Bad: manually inspect a report

```text
CI: run tests
Developer: open coverage report and decide whether 80% looks acceptable
```

This does not create an enforceable compliance gate and can allow regressions
through inconsistent review.

### Bad: inflate coverage without testing behavior

```ts
it("executes the branch", () => {
  service["privateMethod"]();
});
```

Executing an internal method without asserting a meaningful result may improve
the number while leaving the business contract unprotected.

## References

- [001-testing-stack-and-tools.md](001-testing-stack-and-tools.md)
- [006-testing-practices-and-organization.md](006-testing-practices-and-organization.md)
