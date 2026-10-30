# Project memory

The workflow persists its state in the project's `.agents/` directory so that the next session picks up where you left off.

```text
.agents/
  memory.md        # requirements, features, statuses — owned by the orchestrator
  spec.md          # spec of the feature in progress — written by Delivery
  archived/
    <feature>.md   # specs of finished features
```

## `memory.md`

Only the orchestrator writes it.

```markdown
## Project: {name}
## Status: PLANNING | IN PROGRESS | COMPLETE | NEEDS_ATTENTION
## Last Updated: {date}

## Clarified Requirements
- {question}: {answer}

## Business Features

| ID  | Feature | Status | Delivery | Refactor |
|-----|---------|--------|----------|----------|
| 001 | {title} | PENDING | - | - |

## Needs Attention
- None
```

## `spec.md` lifecycle

1. Delivery writes the plan: outcome, acceptance criteria, edge cases, implementation steps, applied rules, and coverage plan.
2. After your approval, Delivery implements and may append an `## Execution Report`.
3. Refactor appends a `## Refactoring Report`.
4. The orchestrator archives it as `.agents/archived/{feature-name}.md`.

Archived specs are a precise history of *why* each change was made and how it was verified.

## Why `.agents/` stays local

The orchestrator keeps `.agents/` local and does not force-add it to Git. It is working state for you and your agents, not a shared artifact. Shared, versioned conventions belong in [`.opencode/rules/`](../guides/customize-rules) instead.

::: tip
The plugin never edits `.gitignore`. Add `.agents/` to it yourself if it is not already ignored.
:::
