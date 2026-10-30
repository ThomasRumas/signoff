# CodeGraph

[CodeGraph](https://github.com/colbymchenry/codegraph) indexes the project into a local knowledge graph (`.codegraph/`). Agents query it to understand structure, call flows, and the impact of a change, instead of grepping and reading files one by one.

## Build the index

Each project is indexed once; the index then syncs automatically.

```text
/codegraph-init
```

The orchestrator also checks for the index before its first feature and offers to build it. Indexing a large repository can take a few minutes.

## How agents use it

When the index exists, every session is told to prefer the `codegraph_explore` tool (or `codegraph explore "<question>"` in the shell) over reading files one by one.

The plugin registers CodeGraph's MCP server itself:

- `codegraph install` is not needed;
- no agent configuration or `AGENTS.md` is modified;
- telemetry is always disabled (`CODEGRAPH_TELEMETRY=0`).

## When it helps

- Large or unfamiliar codebases.
- Questions such as "who calls this service?" or "what breaks if I change this DTO?".
- Reducing the tokens spent on exploration.

## Version control

The plugin does not change `.gitignore`. Decide yourself whether to commit `.codegraph/` or other generated folders such as `.archify/`.
