# Configuration

## Plugin options

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "@thomasrumas/signoff",
      "options": { "agents": "global" }
    }
  ]
}
```

| Option | Values | Default | Description |
| --- | --- | --- | --- |
| `agents` | `"global"`, `"project"`, `"none"` | `"global"` | Where agent files are installed. |

## Environment variables

| Variable | Effect |
| --- | --- |
| `XDG_CONFIG_HOME` | Base directory for global agents (`$XDG_CONFIG_HOME/opencode/agents/`). |
| `APPDATA` | Base directory for global agents on Windows when `XDG_CONFIG_HOME` is unset. |
| `XDG_CACHE_HOME` / `LOCALAPPDATA` | Base directory for the bundled CLI launchers. |
| `CODEGRAPH_TELEMETRY` | Always forced to `0` by the plugin. |

## Paths

| Path | Content | Versioned? |
| --- | --- | --- |
| `~/.config/opencode/agents/` | Global agents | — |
| `<project>/.opencode/agents/` | Project agents (`agents: "project"`) | Your choice |
| `~/.cache/opencode-signoff/bin` | `ocr` and `codegraph` launchers | — |
| `.agents/` | Memory, current spec, archived specs | No, kept local |
| `.agents/skills/` | Project skills | Yes |
| `.opencode/rules/<stack>/` | Installed or written rule stacks | Yes |
| `.opencodereview/rule.json` | Open Code Review rules | Yes |
| `.codegraph/` | CodeGraph index | Your choice |
