# Troubleshooting

## The agents don't appear

- Restart OpenCode or start a new session after installing the plugin.
- Check the `agents` option: with `"none"`, agents are not installed.
- Inspect registered agents: `opencode api get /api/agent`.

## My edits to an agent disappeared

Installed agents are overwritten when they differ from the bundled version. Copy the agent under another name to customize it.

## A rule doesn't apply

- **Stack not installed.** Rules only apply from `.opencode/rules/<stack>/`. Run `/rules-install`, or ask the agent to call `rules_check` to see what is installed.
- **Stack not detected.** The nearest `package.json` of the file must declare one of the stack's `detect` dependencies.
- **Glob case.** Globs must be lowercase; paths are lowercased before matching.
- **Order.** Only the first matching check per stack applies. Put specific globs in files that sort earlier.
- **Invalid rules.** Ask the agent to run `rules_check`: it reports missing titles, uppercase globs, and missing sources.

## The review ignores the team rules

- Install rules first (`/rules-install` or your own); `/ocr-rules` only writes installed stacks.
- Run `/ocr-rules` and confirm the write.
- Check for a catch-all entry in `.opencodereview/rule.json`: existing entries stay first and can shadow team entries. `/ocr-rules` warns about them.
- Rerun `/ocr-rules` after updating the plugin.

## `ocr` or `codegraph` not found

The launchers live in `~/.cache/opencode-signoff/bin` and are added to `PATH` for agent shells only, not your own terminal. Restart OpenCode if they are missing.

## `/review` fails on Git

Open Code Review requires Git 2.41 or later: `git --version`.

## CodeGraph MCP not connected

- Build the index with `/codegraph-init`.
- Restart OpenCode so the MCP server is registered again.

## The workflow stopped

It pauses when an approval is missing or before a new feature when uncommitted changes remain. Answer the pending question or commit your changes; the orchestrator resumes the same workflow.
