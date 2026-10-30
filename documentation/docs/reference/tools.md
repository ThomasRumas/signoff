# Tools

Tools the plugin registers for agents.

## `rules_for`

Returns the team engineering rules that apply to the given files: one check per matching stack, plus the sources to read.

| Input | Type | Description |
| --- | --- | --- |
| `paths` | `string[]` | Files to plan, change, or review, relative to the project root. They do not need to exist yet. |

For each installed stack whose `detect` dependencies appear in the nearest `package.json` (or that has no `detect`), it returns the first check whose `globs` match. Used by Delivery and Refactor. With no installed stack, it says so and returns no check.

## `rules_install`

Installs the plugin's bundled rule stacks into the project's `.opencode/rules/<stack>/`.

| Input | Type | Description |
| --- | --- | --- |
| `action` | `"list" \| "preview" \| "apply"` | `list` shows bundled stacks and whether each is installed; `preview` shows the files to write; `apply` writes them. |
| `stacks` | `string[]` | Stack IDs from `list`, for `preview` and `apply`. |
| `overwrite` | `boolean` | Replace installed files that differ from the plugin's version. Defaults to `false`. |

Agents always preview and get your confirmation before `apply`. Used by [`/rules-install`](./commands#rules-install) and by the `author-engineering-rules` skill to find example stacks.

## `rules_check`

Validates the rules installed in the project's `.opencode/rules/`: stack guide, check titles, lowercase globs, existing sources, and check size. Takes no input. Used by the `author-engineering-rules` skill after writing rules.

## `ocr_rules`

Manages the team rules in `.opencodereview/rule.json`.

| Input | Type | Description |
| --- | --- | --- |
| `action` | `"list" \| "preview" \| "apply"` | `list` shows stacks and checks; `preview` returns the merged file; `apply` writes it. |
| `stacks` | `{ id: string; root?: string }[]` | Selected stacks and their application directory, for `preview` and `apply`. |

Agents always preview and get your confirmation before `apply`. Used by [`/ocr-rules`](./commands#ocr-rules).

## `codegraph_init`

Checks or builds the project's CodeGraph index.

| Input | Type | Description |
| --- | --- | --- |
| `action` | `"status" \| "init"` | `status` reports whether `.codegraph/` exists; `init` indexes the project. |

Agents ask before running `init`, which can take minutes on large repositories.

## `codegraph_explore`

Provided by CodeGraph's MCP server, registered by the plugin. Answers questions about code structure, call flows, and change impact.

## Bundled CLIs

`ocr` and `codegraph` launchers are written to `~/.cache/opencode-signoff/bin` (`$XDG_CACHE_HOME` or `%LOCALAPPDATA%` when set). That directory is prepended to `PATH` for every shell command an agent runs. Neither CLI needs Node.js at runtime.
