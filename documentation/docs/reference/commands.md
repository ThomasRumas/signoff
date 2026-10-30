# Commands

## `/review`

Switch to the `reviewer` agent and review the current changes with Open Code Review. Optional input: a branch range or commit.

```text
/review
/review main..HEAD
```

See [Code review](../guides/code-review).

## `/rules-install`

Install the plugin's bundled engineering rules into the project's `.opencode/rules/`. Interactive: select stacks, preview the files, then confirm. Existing files that differ are kept unless you confirm `overwrite`.

See [Install the plugin's rules](../guides/install-rules).

## `/ocr-rules`

Install or update the installed team rules in the repository's `.opencodereview/rule.json`. Interactive: select stacks and application directories, preview, then confirm. Requires at least one installed stack ([`/rules-install`](#rules-install) or your own).

See [Review rules (OCR)](../guides/ocr-rules).

## `/codegraph-init`

Build the CodeGraph index for the current project.

See [CodeGraph](../guides/codegraph).

## Ponytail commands

The plugin bundles [`@dietrichgebert/ponytail`](https://www.npmjs.com/package/@dietrichgebert/ponytail) and exposes its skills and commands. Do not add ponytail separately: its skills, commands, and hooks would be registered twice.
