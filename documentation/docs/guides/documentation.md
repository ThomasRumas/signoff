# Technical documentation

The `documentation` agent helps create, update, and audit a project's technical documentation.

## What it produces

| Request | Skill |
| --- | --- |
| Architecture overview, system context, containers, components | `docs-c4` |
| Decision, "why did we choose", technology or pattern choice | `docs-adr` |
| Request flow, scenario, call order, integration | `docs-sequence` |
| Domain or object model, classes, inheritance | `docs-class` |
| Workflow, entity lifecycle and states, module dependencies, deployment | `docs-uml` |
| Database, tables, relations, schema | `docs-erd` |

Diagrams default to Mermaid in Markdown; complex diagrams use [Archify](https://github.com/tt-a1i/archify).

## Workflow

1. **Discover** existing documentation first — Markdown, ADR folders, Mermaid blocks, Archify outputs — and propose updating rather than duplicating.
2. **Audit** when you don't know what to produce: `docs-audit` returns a fix plan you pick from.
3. **Draft** grounded in code, schema, or configuration; uncertain elements are marked `TODO: confirm`.
4. **Approve**: answer `Write`, `Adjust`, or `Cancel`. Nothing is written before `Write`.
5. **Index**: `docs/README.md` (and `docs/adr/README.md` for ADRs) is updated.

Accepted ADRs are never rewritten; a new ADR supersedes them. The agent does not modify application code, `.gitignore`, or commit.
