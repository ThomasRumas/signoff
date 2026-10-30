# Skills

## Bundled skills

| Skill | Used by | Purpose |
| --- | --- | --- |
| `docs-conventions`, `docs-audit`, `docs-c4`, `docs-adr`, `docs-sequence`, `docs-class`, `docs-uml`, `docs-erd` | documentation | Technical documentation conventions, audit, and diagram kinds. |
| `ponytail-review` | refactor | Scoped review findings (provided by the bundled ponytail plugin). |
| `author-engineering-rules` | you, on request | Interviews you and writes engineering rules for your project. See [Write your own rules](../guides/write-your-own-rules). |

## Vendored third-party skills

Copied at pinned commits, with their licenses and an `UPSTREAM.json` recording the source.

| Skill | Source | License |
| --- | --- | --- |
| `open-code-review-delegate` | [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | Apache-2.0 |
| `grill-me`, `grilling` | [mattpocock/skills](https://github.com/mattpocock/skills) | MIT |
| `cyclomatic-complexity` | [saurabhkumar8112/cyclomatic-complexity-skill](https://github.com/saurabhkumar8112/cyclomatic-complexity-skill) | Apache-2.0 |
| `archify` | [tt-a1i/archify](https://github.com/tt-a1i/archify) | Apache-2.0 |

## Project skills

The plugin also discovers skills in the project's `.agents/skills` directories. Project skills override bundled skills with the same ID.

```sh
npx -y skills@latest add vercel-labs/agent-skills -a opencode
```

Restart OpenCode or start a new session after adding skills.

The plugin does not import user-global `~/.agents/skills` or `~/.config/opencode/skills`.
