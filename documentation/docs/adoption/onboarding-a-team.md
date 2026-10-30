# Onboarding a team

A new developer becomes effective when they learn the company's rules, the team's conventions, and the reasons behind them. The plugin gives AI agents the same onboarding. This page explains how to roll it out to a team.

## 1. Agree on the rules before the agents apply them

Start from the bundled rules, from your existing conventions, or both, and review them as a team:

- Install the bundled stacks that match your stack with [`/rules-install`](../guides/install-rules), and [write your own](../guides/write-your-own-rules) for what they don't cover.
- Keep the checks that match how you work, and edit the ones that differ in `.opencode/rules/<stack>/`.
- Write down the **why** for each decision: agents apply it with judgment, and newcomers learn from it.

Rules are Markdown in the repository: change them through pull requests, like code.

## 2. Make the review use the same rules

```text
/ocr-rules
```

Commit `.opencodereview/rule.json`. From now on, what guides the agents is what the review checks, locally and in CI.

## 3. Start with one volunteer feature

Pick a small, well-understood feature and run it through the `orchestrator` with the team watching. Discuss the spec, the acceptance criteria, and the Refactor report together. It sets a shared expectation of what "approved" and "done" mean.

## 4. Document what newcomers keep asking

Use the `documentation` agent to write the architecture overview, the main decisions, and the flows people ask about most. The same documents help the next developer and the next agent session.

## 5. Keep the rules alive

- When a review comment repeats, turn it into a check.
- When a decision changes, update or supersede it; don't leave contradictions.
- Rerun `/ocr-rules` after changing checks or updating the plugin.

::: tip
The same rules that onboard your agents onboard your next human teammate. Point new developers to the [rules catalogue](/rules/) on their first day.
:::
