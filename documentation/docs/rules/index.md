# Rules catalogue

These pages are generated at build time from the plugin's `rules/` directory. They are a **catalogue**: nothing applies to your project until you install a stack with [`/rules-install`](../guides/install-rules). You can also [write your own rules](../guides/write-your-own-rules).

<RuleStats />

## Stacks

| Stack | Detected by | Guide |
| --- | --- | --- |
| NestJS | `@nestjs/core` | [NestJS API best practices](./nestjs/README) |
| Vue | `vue` | [Frontend best practices](./vue/README) |

## How to read them

- **Checks** (`checks/`) are short checklists bound to file globs. They are what `rules_for` returns and what `/ocr-rules` installs for review.
- **Architecture** (`architecture/`) holds the decision records that shape the application structure.
- **Engineering rules** (`engineering-rules/`) detail each topic with its context, decision, rules, rationale, and alternatives.

Use the search (<kbd>Ctrl</kbd> <kbd>K</kbd>) to find a rule by keyword. To adapt an installed rule to your project, see [Customize the rules](../guides/customize-rules).
