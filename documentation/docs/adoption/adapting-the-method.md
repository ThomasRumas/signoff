# Adapting the method

The plugin encodes one way of working: clarify, specify, approve, implement, verify, commit. It is an example, not a dogma. The goal is to show that agents can follow **your** team's method instead of improvising their own.

## What you can change

Everything that defines the method is Markdown you can read and edit:

| Part | Where | What it controls |
| --- | --- | --- |
| Agents | `agents/*.md` (installed in your OpenCode agents directory) | Roles, steps, approvals, report formats |
| Rules | `.opencode/rules/<stack>/` (installed from the plugin or written by you) | Conventions applied while coding and reviewing |
| Skills | `.agents/skills/` | Specialized know-how loaded on demand |

::: warning
Installed agents are overwritten when they differ from the bundled version. Copy an agent under a new name before changing it.
:::

## Example: a test-first variant

To make Delivery work test-first, copy the `delivery` agent as `delivery-tdd` and change its implementation section:

```markdown
## Implementation

After explicit approval:

1. For each `AC-*` and `EC-*`, write a failing test first and run it to confirm it fails.
2. Implement the smallest change that makes the test pass.
3. Refactor while keeping all tests green.
4. Record in the execution report the order in which tests went from red to green.
```

Then point the orchestrator at `delivery-tdd` in a copied orchestrator agent. The approval gates, rules, verification, and memory keep working unchanged.

## Other ideas

- **Pair-review gate:** require a second developer's approval of the spec for risky features.
- **Architecture-first:** have the `documentation` agent draft an ADR before Delivery writes the spec for structural changes.
- **Smaller batches:** ask the orchestrator to cap features at a number of files or a review time.

Whatever you choose, keep the two invariants that make the plugin trustworthy: **explicit human approval before code**, and **independent verification after it**.
