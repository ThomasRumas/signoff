# Customize the rules

Rules live in your repository under `.opencode/rules/<stack>/`. You get them by [installing the plugin's rules](./install-rules), by [writing your own](./write-your-own-rules), or both.

::: info Why `.opencode/` and not `.agents/`?
The orchestrator keeps `.agents/` local and ignored. Rules are shared team conventions, so they must be versioned.
:::

## Edit a check or a rule

Installed files are your copies: edit them directly, and review the change in a pull request. For example, to change the NestJS controller check:

```text
.opencode/rules/nestjs/checks/03-controller.md
```

```markdown
---
title: NestJS controller (transport boundary).
globs: ["**/*.controller.ts"]
sources: [engineering-rules/design/001-business-oriented-api-design.md]
---
- Keep handlers thin: ...
- Our project returns Promises, not Observables.
```

Rerun [`/rules-install`](./install-rules) after a plugin update: your edited files are kept unless you confirm `overwrite`.

## Rules per application directory

In a monorepo, a rules directory in the directory where OpenCode runs is also read. When the same relative path exists in both, the one closest to the working directory wins:

```text
.opencode/rules/nestjs/checks/03-controller.md            # repository-wide
apps/api/.opencode/rules/nestjs/checks/03-controller.md   # OpenCode running in apps/api
```

## Add project-wide checks

A new stack folder adds checks. A stack without `detect` applies to every file:

```text
.opencode/rules/project/
  README.md
  checks/
    01-migrations.md
```

```markdown
---
description: Project-wide conventions for the billing service.
review-marker: billing-conventions
---

# Billing conventions
```

## Add a stack

Give the stack `README.md` a `detect` list of dependencies; the stack applies to files whose nearest `package.json` declares one of them:

```yaml
---
description: Angular front-end applications.
detect: ["@angular/core"]
review-marker: angular-best-practices
---
```

## Writing checks well

- Keep each check short: it is loaded for every matching file.
- Use lowercase globs.
- Name files so specific globs sort before broad ones (`01-…`, `02-…`): the first match wins.
- Point `sources` to the detailed documents rather than duplicating them.

## Validate

Ask the agent to run the `rules_check` tool. It validates the stack guide, check titles, lowercase globs, sources, and check size for the rules installed in the project.

After changing checks, rerun [`/ocr-rules`](./ocr-rules) so the review uses them too.
