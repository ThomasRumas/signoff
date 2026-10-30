---
name: author-engineering-rules
description: 'Guide the user through authoring engineering rules for their own project: a new rule set for a technology, framework, or language, or new rules added to an installed stack. Use when: writing team or project conventions as rules, creating a stack of rules, adding an architecture decision, an engineering rule or a theme, defining code patterns, coding standards, library choices, testing strategy, or writing runtime checks (checks/*.md) that agents and code review apply. Interviews the user theme by theme (Architecture, Code Patterns, Libraries, Testing) and collects good/bad code examples, documentation links, and internal documents as evidence before writing.'
---

# Author Engineering Rules

Produce rule documents that agents load with `rules_for` and that `/ocr-rules` installs for code review. Interview the user, collect evidence, draft, get approval, then write.

- Interview in the user's language; write all rule files in English.
- Use [templates](./references/templates.md) for every file you write.
- Use the [interview question bank](./references/interview.md) for each theme.

## Rules root

Rules live under a rules root, one folder per stack: `<root>/<stack>/`.

| Situation | Rules root |
| --- | --- |
| The user's project (default) | `.opencode/rules/` at the project root. Commit it. |
| The plugin's own repository (it contains `plugin/rules/`) | `plugin/rules/` |

Use the project root unless the working directory is the plugin repository and the user wants to change the bundled rules. Ask when unclear. Paths below such as `rules/<stack>/` are relative to the rules root.

Only stacks under `.opencode/rules/` are active in a project. The plugin's bundled stacks are a catalogue: the user opts in with `/rules-install`.

## Target Layout

```text
<root>/<stack>/
  README.md                         # frontmatter: description, detect, review-marker
  architecture/NNN-<slug>.md        # "# Decision: ..."
  checks/NN-<slug>.md               # frontmatter: title, globs, sources; body <= 40 lines
  engineering-rules/
    README.md                       # index of themes
    <theme>/README.md               # rules table + core principle
    <theme>/NNN-<slug>.md           # "# Rule: ..."
```

Before writing, read one existing file of the same kind to match tone and depth: a file of the installed stack you extend, or a bundled one. Call `rules_install` with action `list` to get the path of each bundled stack guide.

## Workflow

### 0. Determine the mode

Ask which applies:

1. **New stack**: run every step.
2. **Extend an installed stack**: new theme, new rule, or new architecture decision. Read `<root>/<stack>/` first. Reuse its themes, continue its numbering, and do not duplicate existing decisions. Edit the installed files in place; they are the user's copies.
3. **Extend a bundled stack that is not installed**: either install it first (the user runs `/rules-install`), or create a separate project stack that holds only the new rules.
4. **Checks only**: go to step 6.

If the user only wants the plugin's NestJS or Vue rules as they are, do not author anything: point them to `/rules-install`.

### 1. Stack identity (new stack only)

Collect:

- Stack folder name (kebab-case, e.g. `angular`, `spring-boot`, or `project` for conventions that span the whole repository).
- `description`: one line describing the targeted applications and defaults.
- `detect`: dependency names in `package.json` that identify the stack (e.g. `["@angular/core"]`). Detection only reads `package.json` dependencies. For a stack outside the JavaScript ecosystem, or one that spans the repository, omit `detect`: the stack then applies to every file, so keep its globs specific.
- `review-marker`: unique across stacks, e.g. `<stack>-best-practices`. It identifies the stack's entries in `.opencodereview/rule.json`.
- Default choices (language version, runtime, database, build tool) and any explicit non-goals.

### 2–5. Themes, one at a time

Cover the themes in this order. The user may skip a theme or add custom ones (e.g. observability, pagination, scheduling).

| Step | Theme | Output |
| --- | --- | --- |
| 2 | Architecture | `architecture/NNN-*.md` decisions |
| 3 | Code Patterns | `engineering-rules/<theme>/` rules (one theme per concern) |
| 4 | Libraries | Library decisions inside the owning theme, or a dedicated theme |
| 5 | Testing | `engineering-rules/testing-strategy/` |

For each theme, loop:

1. **Ask** the questions for that theme from the question bank. Ask a few at a time, not the whole list. Skip what the project's code or documentation already answers.
2. **Collect evidence.** Always ask for:
   - a good code example (what we want),
   - a bad code example (what we reject, and why),
   - official documentation links,
   - internal documents, ADRs, incident reports, or existing project code,
   - accepted exceptions.
3. **Propose a file plan:** file names (`NNN-slug.md`), one-line decision for each, Status. Wait for confirmation.
4. **Draft** each file from the template. Show the draft.
5. **Revise** until the user approves, then write the files.
6. Update the theme `README.md` rules table.

### 6. Checks

Derive checks from the accepted `MUST`/`MUST NOT` rules:

- One check per kind of file, matched by `globs` (lowercase only). Only the first matching check per stack applies, so order filenames from most to least specific.
- `sources` lists stack-relative paths to the decisions and rules that justify each check. Every path must exist.
- The body is a bullet list of at most 40 lines. Each bullet is a reviewable statement; leave the rationale in the source documents.

### 7. Index and validate

1. Update `<root>/<stack>/engineering-rules/README.md` and the `Engineering Rule Sets` section of `<root>/<stack>/README.md`.
2. Validate and fix every reported error:
   - user project: call the `rules_check` tool;
   - plugin repository: run `npm --prefix plugin run rules:check`.
3. Summarize the files created and any rules left as `Proposed`.
4. Suggest next steps: review and commit the rules through a pull request, then run `/ocr-rules` so the code review applies the same checks. Do not stage or commit anything yourself.

## Quality Rules

- One decision per file. Split a rule when it mixes unrelated concerns.
- Every rule has a `Rationale`. Do not write a rule the user cannot justify.
- A `MUST` rule needs at least one user-provided reference or example. Without evidence, use `Status: Proposed` and `SHOULD` wording.
- Use RFC-style keywords (`MUST`, `MUST NOT`, `SHOULD`, `MAY`) in `Rules` sections only.
- Code examples come from the user or are minimal illustrations the user approved. Mark bad examples clearly.
- Never invent URLs. Cite only links the user provided or that you fetched and verified.
- Keep project-specific requirements out of generic rules. Put them in an explicit exception or a project stack.
- Link related rules with relative paths instead of repeating their content.
