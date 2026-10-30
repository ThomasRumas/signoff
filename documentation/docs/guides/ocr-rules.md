# Review rules (OCR)

Open Code Review reads its rules from `<repo>/.opencodereview/rule.json`. `/ocr-rules` installs the checks of your installed rule stacks there. Install some first with [`/rules-install`](./install-rules) or [write your own](./write-your-own-rules).

## Install the rules

Run in the repository:

```text
/ocr-rules
```

1. It lists the rule stacks and their checks.
2. You select the stacks the project needs and, for each, its **application directory** (the repository root by default).
3. It previews the merged file, with warnings for existing catch-all entries that would shadow the team rules.
4. It writes the file only after your confirmation.

## Monorepos

Globs are prefixed with each stack's application directory, so stacks in different directories do not shadow each other:

| Stack | Directory | Glob |
| --- | --- | --- |
| `nestjs` | `apps/api` | `apps/api/**/*.controller.ts` |
| `vue` | `apps/web` | `apps/web/{**/stores/**/*.{ts,js},**/*.store.{ts,js}}` |

## Merge behavior

- Existing entries, `include`, and `exclude` are kept and stay first, so **project rules keep priority**.
- Team entries are identified by their `[<review-marker>]` prefix and **replaced on each run**.
- Entries set `merge_system_rule: true` to keep OCR's built-in language rules.

::: tip
Rerun `/ocr-rules` after updating the plugin or [customizing the rules](./customize-rules).
:::

## Share and use in CI

Commit `.opencodereview/rule.json` to share the rules with the team and with CI. Then run [`/review`](./code-review) to review with them.
