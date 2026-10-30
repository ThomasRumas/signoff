# Agents

The plugin installs five agents. See [Installation](../getting-started/installation#agent-installation-mode) for where they are written.

## orchestrator

**Mode:** primary · **Tools:** read, write, todowrite, question, skill, bash, `codegraph_init` · **Skills:** `grill-me`

Splits requests into approved features and coordinates Delivery, Refactor, and archiving, then recommends a commit. It alone maintains `.agents/memory.md` and never writes specs, production code, reviews, or tests.

## delivery

**Mode:** subagent · **Tools:** read, write, grep, glob, bash, skill, question, `rules_for`

Plans one feature in `.agents/spec.md`, obtains explicit approval, then implements and tests the approved plan. Optionally appends an `## Execution Report`. Uses `playwright-cli` for frontend changes when available.

## refactor

**Mode:** subagent · **Tools:** read, write, grep, glob, bash, skill, `rules_for` · **Skills:** `ponytail-review`, `cyclomatic-complexity`

Captures the Delivery file inventory from the feature-start `HEAD`, runs a scoped review, verifies every `AC-*` and `EC-*` and the rule checks, fixes directly related issues, and appends a `## Refactoring Report`.

## reviewer

**Mode:** primary

Reviews changes with Open Code Review in delegation mode, reports findings with file coverage, proposes a fix plan, and asks before applying fixes. Started by [`/review`](./commands#review).

## documentation

**Mode:** primary · **Skills:** `docs-conventions`, `docs-audit`, `docs-c4`, `docs-adr`, `docs-sequence`, `docs-class`, `docs-uml`, `docs-erd`, `archify`

Discovers, creates, updates, and audits technical documentation. See the [guide](../guides/documentation).

## Common guarantees

No agent stages, commits, amends, pushes, or publishes.

## Customizing an agent

Installed agents are overwritten when they differ from the bundled version. Copy an agent under another name to customize it.

The agents' legacy `skills:` fields do not restrict which skills are available. To restrict skill access, configure ordered `permissions` rules for the `skill` action; the last matching rule wins, so put the deny rule first:

```yaml
permissions:
  - { action: skill, resource: "*", effect: deny }
  - { action: skill, resource: "grill-me", effect: allow }
```
