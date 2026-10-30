# Ways of using it

The plugin is a set of independent parts. Adopt the one that solves your most painful problem first, then add the others when the team is ready.

## Review only

Start here if AI-generated changes already reach your pull requests and reviews are the bottleneck.

```text
/review main..HEAD
```

You get file-by-file coverage, findings ranked by severity, and a fix plan applied only after your approval. No workflow change is needed. See [Code review](../guides/code-review).

## Rules for agents and review

Start here if the code works but doesn't look like your team's code.

1. Get rules into the project, one of two ways:
   - run `/rules-install` to install the bundled NestJS or Vue rules, or
   - ask the agent to use the `author-engineering-rules` skill to write rules for your own stack and conventions.
2. Run `/ocr-rules` so the review uses the same checks.
3. Edit or add rules in `.opencode/rules/` as the team agrees on them.

See [Engineering rules](../concepts/engineering-rules), [Install the plugin's rules](../guides/install-rules), and [Write your own rules](../guides/write-your-own-rules).

## Documentation only

Start here if knowledge lives in a few heads and onboarding is slow. The `documentation` agent audits what exists, then writes C4 diagrams, ADRs, sequence diagrams, or ERDs from the code, after your approval. See [Documentation agent](../guides/documentation).

## Full workflow

Use the `orchestrator` when you deliver features with agents. You get approval gates, specs with acceptance criteria, independent verification, project memory, and suggested commits. See the [tutorial](../getting-started/first-feature).

## A suggested path

```mermaid
flowchart LR
  A[Review only] --> B[Rules for agents and review]
  B --> C[Documentation]
  C --> D[Full workflow]
```

Each step builds trust in the next one: the review shows what the rules catch, the rules make agents' code reviewable, the documentation gives agents and people the same context, and the full workflow puts it all together.
