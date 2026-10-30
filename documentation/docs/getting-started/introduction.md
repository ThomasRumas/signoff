# Introduction

## What is Signoff?

Signoff is an [OpenCode](https://opencode.ai) plugin that makes AI agents work the way a careful team does: clarify the need, write a spec, get it approved, implement within the agreed limits, verify every criterion, and let the developer commit. It brings your team's engineering rules (installed from the plugin's catalogue or written by you), a tooled code review, and a documentation agent.

Here is a minimal session:

```text
> Add pagination to GET /users

orchestrator  Proposed feature 001: paginate the user list      ✋ approve
delivery      spec.md: AC-1, AC-2, EC-1, rules nestjs/03-controller  ✋ approve
delivery      implemented, 3 tests added
refactor      AC-1 ✓  AC-2 ✓  EC-1 ✓  rules ✓  → PASS
orchestrator  Changed files listed. Suggested commit:
              feat(users): paginate user list
```

The example shows the two core ideas of the plugin:

- **Developer-led delivery.** Agents do the volume of work; you approve the features and the spec, and you commit. Nothing ships without your signature.
- **Team knowledge as context.** Agents receive your engineering rules for exactly the files they touch, and the review checks the same rules.

::: info Prerequisites
The documentation assumes you already know how to build the features you ask for. The plugin assists experienced developers; it does not replace their judgment. You need OpenCode v2 and, for code review, Git 2.41 or later.
:::

## Adopt it progressively

Each part of the plugin works on its own. You can start small and add more when it earns its place:

| Start with | What you get | Agent or command |
| --- | --- | --- |
| **Code review** | A first review with file coverage and a fix plan you approve | `/review` |
| **Team rules** | Your conventions applied by agents and by the review | `/rules-install`, `rules_for`, `/ocr-rules` |
| **Documentation** | Architecture, decisions, and flows written from the code | `documentation` agent |
| **Full workflow** | Features, specs, verification, memory, suggested commits | `orchestrator` agent |

Read more in [Ways of using it](../adoption/ways-of-using).

## Which agent should I use?

| You want to… | Use |
| --- | --- |
| Deliver a feature from a need | `orchestrator` |
| Review changes, yours or anyone's | `reviewer`, or `/review` |
| Document the architecture, a decision, or a flow | `documentation` |

`delivery` and `refactor` are subagents: the orchestrator calls them for you.

## What it never does

- It never stages, commits, amends, or pushes. It suggests a commit message.
- It never codes before you explicitly approve the spec.
- It does not modify your `.gitignore` or `AGENTS.md`.
- It sends your code only to the model you configured in OpenCode; CodeGraph telemetry is disabled.

## Still got questions?

Check the [FAQ](../faq), or read [why it matters](./why) for the reasoning behind the plugin.

## Pick your learning path

<div class="learning-paths">

[**Try the tutorial**<br>Deliver your first feature, from the request to the suggested commit.](./first-feature)

[**Read the guide**<br>Understand the workflow, the approvals, and the memory step by step.](../concepts/workflow)

[**Browse the rules**<br>Explore the NestJS and Vue checks and decisions you can install, or write your own.](../rules/)

</div>
