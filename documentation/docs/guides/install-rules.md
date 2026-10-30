# Install the plugin's rules

The plugin ships engineering rules for NestJS and Vue as a catalogue. They are **not active until you install them**: you choose which stacks your project adopts, and they become files in your repository that you own.

## Install

Run in the project:

```text
/rules-install
```

1. It lists the bundled stacks and marks those already installed.
2. You select the stacks to install.
3. It previews the files to create, and those kept because they differ from the plugin's version.
4. It writes them only after your confirmation, then validates the result.

Each selected stack is copied to `.opencode/rules/<stack>/`:

```text
.opencode/rules/nestjs/
  README.md
  architecture/
  engineering-rules/
  checks/
```

You can also ask in plain language: "install the NestJS rules from the plugin in this project".

## After installing

- Agents receive the stack's checks for the files they touch, through [`rules_for`](../reference/tools#rules-for). A stack is applied only to files whose nearest `package.json` declares one of its `detect` dependencies.
- Commit `.opencode/rules/` so the whole team, and CI, share the same rules.
- Run [`/ocr-rules`](./ocr-rules) so the code review applies the same checks.
- Edit the files freely: they are your copies. See [Customize the rules](./customize-rules).

## Update after a new plugin version

Rerun `/rules-install` and select the same stacks. By default:

- missing files are created;
- files you edited are **kept**, and the preview lists them;
- identical files are left alone.

To take the plugin's version of the files that differ, confirm the `overwrite` option: your edits to those files are lost. Review the result with `git diff` before committing.

## Without the plugin's rules

Installing is optional. Without it, no rules are applied and `rules_for` returns nothing. You can [write your own rules](./write-your-own-rules) instead, or alongside the installed ones.
