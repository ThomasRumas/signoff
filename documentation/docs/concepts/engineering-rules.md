# Engineering rules

The team's engineering and coding conventions live as Markdown under `.opencode/rules/<stack>/` in your repository, not inside skills, so every agent can reach them.

```text
.opencode/rules/nestjs/
  README.md          # stack guide; frontmatter: description, detect, review-marker
  architecture/      # decision records
  engineering-rules/ # detailed rules by topic
  checks/            # short checklists bound to file globs, also used for OCR
```

## Two ways to get rules

No rules are active until you add them to the project. You choose:

| Way | How | Use it when |
| --- | --- | --- |
| **Install the plugin's rules** | [`/rules-install`](../guides/install-rules) copies a bundled stack (NestJS, Vue) into `.opencode/rules/`. | Your stack is covered and you want a solid starting point. |
| **Write your own** | The `author-engineering-rules` skill [interviews you and writes the rules](../guides/write-your-own-rules). | Your stack or conventions are not covered, or you already have standards to formalize. |

You can combine both: install a stack, then add your own decisions or a project-wide stack. Either way, the result is plain Markdown in your repository that you [customize](../guides/customize-rules), review in pull requests, and version like code.

## Stack guide

The stack `README.md` frontmatter declares how the stack is detected and identified:

```yaml
---
description: NestJS/TypeScript APIs with Prisma, RxJS, and PostgreSQL as the default database.
detect: ["@nestjs/core"]
review-marker: nestjs-best-practices
---
```

| Field | Purpose |
| --- | --- |
| `description` | Shown in the stack index added to every session. |
| `detect` | Dependencies looked up in the nearest `package.json`. A stack without `detect` applies to every file. |
| `review-marker` | Prefix that identifies the stack's entries in `.opencodereview/rule.json`. |

## Checks

A check is a short checklist bound to file globs:

```markdown
---
title: NestJS controller (transport boundary).
globs: ["**/*.controller.ts"]
sources: [engineering-rules/design/001-business-oriented-api-design.md]
---
- Keep handlers thin: ...
```

- **Matching order.** Checks are matched in file-name order, like OCR's first-match rule, so put specific globs before broad ones (`01-entrypoint.md`, `02-module.md`, …).
- **Lowercase globs.** OCR lowercases file paths before matching, and `rules_for` does the same.
- **Sources** point to the detailed rules and decisions to read when the change touches them.

## How agents use them

The plugin adds a short index of the installed stacks to every session and registers the [`rules_for`](../reference/tools#rules-for) tool. Given the files an agent plans to change or review, it returns, for each detected stack, the first matching check plus the sources to read. With no stack installed, nothing is added.

- **Delivery** calls it when planning and records the applied checks in the spec's `## Rules` section.
- **Refactor** calls it with the changed files and verifies them against the checks.
- **Reviewer** uses the same checks through [`/ocr-rules`](../guides/ocr-rules).

## Decisions

Architecture and engineering documents carry a **status**. Agents treat it as meaningful: a proposed recommendation is not turned into a mandatory rule, and an accepted decision is not silently overridden.

Browse the [rules catalogue](/rules/) of the bundled stacks, [install them](../guides/install-rules), or [write your own](../guides/write-your-own-rules).
