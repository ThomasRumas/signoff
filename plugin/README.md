# Signoff

Developer-led OpenCode agents, team engineering rules, and tooled code review.
You own what ships.

## Install

```sh
opencode plugin add @thomasrumas/signoff
```

For project-scoped agents, add the plugin to your project's OpenCode config and
set the `agents` option:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "@thomasrumas/signoff",
      "options": { "agents": "project" }
    }
  ]
}
```

Restart OpenCode or start a new session after installation so the plugin can
register its skills and agents.

## What is included

- `orchestrator`, `delivery`, `refactor`, `reviewer`, and `documentation`
  agents.
- Opt-in engineering rules for NestJS and Vue, installed with `/rules-install`.
- Bundled Open Code Review (`ocr`) and CodeGraph (`codegraph`) CLIs.
- The `author-engineering-rules` skill and the `docs-*` skills.
- Vendored skills including `open-code-review-delegate`, `grill-me`,
  `grilling`, `cyclomatic-complexity`, and `archify`.

## Documentation

Full documentation: <https://thomasrumas.github.io/signoff/>

Source and issues: <https://github.com/ThomasRumas/signoff>
