# Acceptance criteria and edge cases

Every spec lists what "done" means, in terms you can approve and the agents can verify.

## Format

```markdown
## Acceptance
- AC-1: Given <context>, when <action>, then <result>.

## Edge Cases
- EC-1: <condition> -> <expected behavior>.
```

- **`AC-*`** describe the expected behavior in the nominal cases.
- **`EC-*`** describe limits, invalid input, empty states, concurrency, and failures.

## Traced to tests

The `## Coverage Plan` links every criterion to its implementation and its verification:

```markdown
## Coverage Plan
- AC-1 -> Implementation: src/users/users.service.ts; Verification: users.service.spec.ts "returns the requested page".
- EC-1 -> Implementation: src/users/dto/page.query.ts; Verification: users.controller.spec.ts "rejects pageSize > 100".
```

Delivery implements a test for every `AC-*` and `EC-*`. Refactor then inspects the implementation and tests for each criterion and reports any uncovered item as `NEEDS_ATTENTION`.

## Writing good criteria

- **One observable behavior per criterion.** If you need "and", split it.
- **Observable from outside.** Describe inputs and outputs, not internal steps.
- **Concrete values.** `20 users`, `400 INVALID_PAGE_SIZE` — not "a page" or "an error".
- **Exclusions are explicit.** State what is out of scope in `## Outcome`.
- **Edge cases are where bugs hide.** Empty lists, boundaries, duplicates, unauthorized access, upstream failures.

## Approval

Read the criteria before approving: they are the contract. Answer `Request changes` with what is missing or wrong; Delivery revises the spec and asks again.
