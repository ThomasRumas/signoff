---
name: docs-audit
description: 'Audit a project''s technical documentation for completeness and freshness: inventory Markdown docs, Mermaid diagrams, ADRs and Archify artifacts, compare them with the documentation baseline and the actual code, report missing, incomplete, stale or orphan documents, and propose a prioritized fix plan. Use when: checking if documentation exists or is up to date, before onboarding, after a large change, or when unsure what to document.'
---

# Documentation Audit

Load `docs-conventions` first. This skill is **read-only**: it reports and plans, it never writes documentation without the user's approval.

## Workflow

### 1. Inventory

- Markdown: `docs/**/*.md`, root `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, and folders named `adr`, `decisions`, `architecture`, `design`.
- Diagrams: Mermaid blocks (` ```mermaid `) and their type (`flowchart`, `sequenceDiagram`, `classDiagram`, `erDiagram`, `stateDiagram`, `C4*`); images (`*.png`, `*.svg`, `*.drawio`, `*.puml`).
- Archify: `.archify/*/candidate.json` (read `diagram_type` and `meta`) and their `*.html` outputs.
- ADRs: number, title, status, date.
- For each document, record its last commit date: `git --no-pager log -1 --format=%cs -- <file>`.

### 2. Compare with the Baseline

For each row of the baseline in `docs-conventions`, decide whether the project needs it given its size and risks (a single small service may not need component or class diagrams). Then classify:

| Status | Meaning |
| --- | --- |
| OK | Exists, complete, consistent with code |
| Missing | Needed but absent |
| Incomplete | Exists but lacks scope, explanation, elements, or required sections |
| Stale | Contradicted by the code, or code changed significantly since last update |
| Orphan | Archify artifact or diagram not linked from any Markdown, or broken link |
| Not needed | Not justified for this project; say why |

### 3. Check Against the Code

- **C4**: deployable units (Dockerfiles, compose services, apps in a monorepo) and external services in configuration that are absent from the containers view.
- **ERD**: tables or relations in the schema source absent from the ERD, or ERD tables no longer in the schema.
- **Sequence / activity**: referenced routes, handlers, or files that no longer exist.
- **Class / state**: classes or enum values renamed or removed.
- **ADR**: `Accepted` decisions contradicted by the code (e.g. a library the ADR rejects is a dependency); missing `docs/adr/README.md` index; edited accepted ADRs instead of superseding.
- **Freshness**: compare the document's last commit date with the last commit date of the code it describes.

Report evidence (file path, line, command output) for every non-OK status. Do not guess.

### 4. Report

```markdown
## Documentation Audit — <project> — <YYYY-MM-DD>

| Document | Status | Evidence | Priority |
| --- | --- | --- | --- |
| Container diagram | Stale | `docker-compose.yml` defines `worker`, absent from docs/architecture/containers.md | High |

### Summary
<Two or three sentences on overall state and biggest risks.>
```

Priority: **High** for missing or stale views on critical paths (architecture overview, data model, critical flows, structuring decisions); **Medium** for incomplete documents; **Low** for cosmetic or orphan issues.

### 5. Fix Plan

Propose a numbered plan ordered by priority. For each item: target file, action (create, update, supersede, link, delete), the skill to use (`docs-c4`, `docs-adr`, `docs-sequence`, `docs-class`, `docs-uml`, `docs-erd`), and Mermaid or Archify. Ask the user which items to execute.
