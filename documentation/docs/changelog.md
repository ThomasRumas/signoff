# Changelog

## 1.0.0

- Developer-led workflow: `orchestrator`, `delivery`, and `refactor` agents.
- Standalone `reviewer` agent with Open Code Review in delegation mode, `/review`, and `/ocr-rules`.
- Standalone `documentation` agent with the `docs-*` skills.
- Engineering rules for NestJS and Vue, opt-in: installed with `/rules-install` into `.opencode/rules/`, served by `rules_for`, and editable like any file of the project.
- `author-engineering-rules` skill and `rules_check` tool to write and validate your own rules.
- Bundled `ocr` and `codegraph` CLIs, CodeGraph MCP server, and `/codegraph-init`.
- Vendored skills: `open-code-review-delegate`, `grill-me`, `grilling`, `cyclomatic-complexity`, `archify`.
