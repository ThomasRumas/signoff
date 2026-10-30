# Quick start

Install the plugin, restart OpenCode, and you are ready to deliver your first feature.

## Prerequisites

- OpenCode v2.
- Git 2.41 or later, required by Open Code Review for `/review`.

The `ocr` and `codegraph` CLIs ship with the plugin; you do not need to install them globally.

## Install globally

Make the plugin available across all your projects:

```sh
opencode plugin add @thomasrumas/signoff
```

Restart OpenCode or start a new session so the plugin can register its skills and agents.

## Install for one project

Add the package to the project's OpenCode config and choose where its agents are installed:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "@thomasrumas/signoff",
      "options": { "agents": "project" }
    }
  ]
}
```

## Agent installation mode

OpenCode's plugin API does not create agents directly, so the plugin copies its agent Markdown files into an OpenCode agents directory. Choose where with the `agents` option:

| Value | Target |
| --- | --- |
| `"global"` (default) | `~/.config/opencode/agents/` (or `$XDG_CONFIG_HOME/opencode/agents/`; `%APPDATA%` on Windows) |
| `"project"` | `<project>/.opencode/agents/` |
| `"none"` | Agents are not installed automatically. |

## Updates

At each startup, the plugin installs missing agents and overwrites installed ones that differ from the bundled version, so a new plugin version always replaces them.

::: warning
Local edits to installed agent files are lost on update. To customize an agent, copy it under another name.
:::

Uninstalling the plugin does not remove agents already installed.

After updating, rerun [`/ocr-rules`](../guides/ocr-rules) in repositories that use the team review rules, and [`/rules-install`](../guides/install-rules) to pick up changes to the plugin's rules you installed.

## Optional project setup

In each project, you can:

```sh
/codegraph-init   # build the CodeGraph index
/rules-install    # install the plugin's NestJS or Vue rules in .opencode/rules/
/ocr-rules        # install the installed rules for code review
```

The plugin's rules are opt-in: nothing applies until you run `/rules-install` or [write your own rules](../guides/write-your-own-rules).

Next: [deliver your first feature](./first-feature).
