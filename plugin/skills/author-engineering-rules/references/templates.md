# Templates

Replace `<...>` placeholders. Remove optional sections that have no content; never leave them empty. Paths such as `rules/<stack>/` are relative to the rules root (`.opencode/rules/` in a project).

## Stack README — `rules/<stack>/README.md`

````markdown
---
description: <Applications targeted and default choices, one line.>
detect: ["<package-name>"]
review-marker: <stack>-best-practices
---

# <Stack> Best Practices

<What the guide covers, what it deliberately does not prescribe.>

## Workflow

1. Identify the project policies relevant to the change.
2. Load the engineering-rule family that owns the behavior and apply its decision.
3. Apply organization-specific requirements only when the project adopts them.
4. Treat decision status as meaningful: do not turn a Proposed rule into a mandatory one.
5. Verify at the smallest boundary that proves the change.

## Defaults

- <Default 1>
- <Default 2>

When a documented project context requires a different choice, make the deviation explicit and limit it to the affected boundary.

## Engineering Rule Sets

- [<Decision title>](architecture/001-<slug>.md)
- [<Theme title>](engineering-rules/<theme>/README.md)
````

## Architecture decision — `rules/<stack>/architecture/NNN-<slug>.md`

````markdown
# Decision: <Title>

## Status

<Accepted | Proposed>

## Scope

<Where this decision applies.>

## Context

<Problem and forces. Why a decision is needed.>

## Decision

<The decision in a few sentences.>

## Rules

- <Subject> MUST <...>.
- <Subject> MUST NOT <...>.
- <Subject> SHOULD <...>.

## Rationale

<Why this decision, backed by evidence.>

## Alternatives Considered

- **<Alternative>**: <why rejected>.

## Consequences

- <Positive or negative effect.>

## Exceptions

- <Accepted exception and its boundary.>

## Examples

<Good and bad structure or code, e.g. folder tree.>

## References

- [<Title>](<verified URL or relative path>)
````

## Engineering-rule index — `rules/<stack>/engineering-rules/README.md`

````markdown
# <Stack> Engineering Rules

| Theme | Scope |
| --- | --- |
| [<Theme title>](./<theme>/README.md) | <What the theme decides> |
````

## Theme README — `rules/<stack>/engineering-rules/<theme>/README.md`

````markdown
# <Theme Title>

<What these rules govern; whether examples are illustrative or required.>

## Status

<Accepted | Proposed>

## Rules

| Rule | Scope |
| --- | --- |
| [<Rule title>](./001-<slug>.md) | <One-line scope> |

## Core Principle

<The one idea behind the theme.>

These rules complement [<related theme>](../<other-theme>/README.md).
````

## Engineering rule — `rules/<stack>/engineering-rules/<theme>/NNN-<slug>.md`

````markdown
# Rule: <Imperative title>

## Status

<Accepted | Proposed>

## Scope

<What code this rule applies to.>

## Context

<The problem this rule prevents.>

## Decision

<The decision in a few sentences; name the concrete APIs or libraries.>

## Rules

- <Subject> MUST <...>.
- <Subject> MUST NOT <...>.
- <Subject> SHOULD <...>.

## Examples

### Good

```<lang>
<code following the rule>
```

<Why it is correct.>

### Bad

```<lang>
<code violating the rule>
```

<What goes wrong.>

## Rationale

<Why, backed by evidence.>

## Alternatives Considered

- **<Alternative>**: <why rejected>.

## Consequences

- <Effect.>

## Exceptions

- <Accepted exception.>

## References

- [<Title>](<verified URL or relative path>)
````

## Check — `rules/<stack>/checks/NN-<slug>.md`

Constraints enforced by the `rules_check` tool (and `npm run rules:check` in the plugin repository): `title` and `globs` required, globs lowercase, body non-empty and at most 40 lines, every `sources` path exists inside the stack. Files are evaluated in filename order and only the first match applies.

````markdown
---
title: <File kind> (<role>).
globs: ["**/*.<ext>"]
sources:
  - architecture/001-<slug>.md
  - engineering-rules/<theme>/001-<slug>.md
---
- <Reviewable statement with MUST / MUST NOT / Flag ...>.
````
