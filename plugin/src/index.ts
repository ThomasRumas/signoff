import { mkdir, readdir, readFile, realpath, stat, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { isAbsolute, join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import ponytail from "@dietrichgebert/ponytail"
import { Plugin, Skill } from "@opencode/plugin"
import { parse } from "yaml"
import {
  loadRules,
  matchRules,
  mergeOcrRules,
  NO_STACKS_HINT,
  normalizeRoot,
  renderIndex,
  renderMatches,
  renderStackList,
  runInstall,
  validateRules,
  type OcrSelection,
} from "./rules.ts"
import { registerTools } from "./tools.ts"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const PREFIX = "[signoff]"

interface Frontmatter {
  name?: string
  description?: string
  metadata?: {
    "opencode/autoinvoke"?: boolean
  }
  "disable-model-invocation"?: boolean
}

async function loadSkill(directory: string, id: string): Promise<Skill.Info | undefined> {
  const path = join(directory, "SKILL.md")

  try {
    const raw = await readFile(path, "utf8")
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
    const frontmatter = (match ? parse(match[1]) : undefined) as Frontmatter | undefined
    const content = (match ? raw.slice(match[0].length) : raw).trimStart()

    if (!frontmatter?.description) {
      console.warn(`${PREFIX} Skill "${id}" has no description and will not be advertised.`)
    }

    const autoinvoke =
      frontmatter?.metadata?.["opencode/autoinvoke"] === false ||
      frontmatter?.["disable-model-invocation"] === true
        ? false
        : undefined

    return {
      id: id as Skill.ID,
      name: (frontmatter?.name ?? id) as Skill.Name,
      description: frontmatter?.description,
      ...(autoinvoke === false ? { autoinvoke: false } : {}),
      path: path as Skill.Info["path"],
      content,
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return
    console.error(`${PREFIX} Failed to load skill "${id}"`, error)
  }
}

async function loadSkillsFrom(source: string, skills: Map<string, Skill.Info>): Promise<void> {
  let entries
  try {
    entries = await readdir(source, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return
    console.warn(`${PREFIX} Could not read skills from "${source}"`, error)
    return
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue

    const directory = join(source, entry.name)
    let info
    try {
      info = await stat(directory)
    } catch {
      continue
    }
    if (!info.isDirectory()) continue

    let base = directory
    try {
      base = await realpath(directory)
    } catch {
      // Keep the original path when realpath fails.
    }

    const skill = await loadSkill(base, entry.name)
    if (skill) skills.set(skill.id, skill)
  }
}

async function loadSkills(location: Plugin.Context["location"]): Promise<Skill.Info[]> {
  const skills = new Map<string, Skill.Info>()
  // Later roots override earlier ones, so the most specific local skill wins.
  const roots: string[] = [join(ROOT, "skills")]

  const project = location.project?.directory ?? location.directory
  const rel = relative(project, location.directory)
  const parts = rel && !rel.startsWith("..") && !isAbsolute(rel) ? rel.split(sep) : []

  for (let i = 0; i <= parts.length; i++) {
    roots.push(join(project, ...parts.slice(0, i), ".agents", "skills"))
  }
  roots.push(join(location.directory, ".agents", "skills"))

  const seen = new Set<string>()
  for (const root of roots) {
    let source
    try {
      source = await realpath(root)
    } catch {
      continue
    }
    if (seen.has(source)) continue
    seen.add(source)
    await loadSkillsFrom(source, skills)
  }

  return [...skills.values()]
}

// Bundled rules are a catalogue: only rules installed in the project are active.
function ruleRoots(location: Plugin.Context["location"]): string[] {
  const project = location.project?.directory ?? location.directory
  return [join(project, ".opencode", "rules"), join(location.directory, ".opencode", "rules")]
}

async function registerRules(ctx: Plugin.Context): Promise<void> {
  const roots = ruleRoots(ctx.location)
  const catalogue = join(ROOT, "rules")
  const project = ctx.location.project?.directory ?? ctx.location.directory
  const installDir = join(project, ".opencode", "rules")

  await ctx.session.hook("context", async (event) => {
    const index = renderIndex(await loadRules(roots))
    if (index) event.system.push({ type: "text", text: index })
    if (event.agent !== REVIEWER) event.system.push({ type: "text", text: REVIEW_DELEGATION })
  })

  await ctx.tool.transform((editor) => {
    editor.add({
      name: "rules_for",
      description:
        "Return the team engineering rules that apply to the given files: one check per matching stack, plus the cookbook sources to read. Call it before planning, editing, or reviewing those files.",
      input: {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: { type: "string" },
            description: "Files to plan, change, or review, relative to the project root. They do not need to exist yet.",
          },
        },
        required: ["paths"],
        additionalProperties: false,
      },
      async execute(input) {
        const paths = (input as { paths?: unknown })?.paths
        if (!Array.isArray(paths) || !paths.every((path) => typeof path === "string")) {
          return { content: "`paths` must be an array of file paths." }
        }
        const stacks = await loadRules(roots)
        if (stacks.length === 0) return { content: NO_STACKS_HINT }
        return { content: await renderMatches(await matchRules(stacks, ctx.location.directory, paths)) }
      },
    })

    editor.add({
      name: "rules_install",
      description:
        "Install the plugin's bundled rule stacks into the project's `.opencode/rules/<stack>/`. `list` shows the bundled stacks, whether each is installed, and the path of each stack guide. `preview` shows the files that would be written. `apply` writes them. Existing files that differ are kept unless `overwrite` is true. Always preview and get the user's confirmation before `apply`.",
      input: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["list", "preview", "apply"] },
          stacks: { type: "array", items: { type: "string" }, description: "Stack IDs from `list`, for preview and apply." },
          overwrite: { type: "boolean", description: "Replace installed files that differ from the plugin's version. Defaults to false." },
        },
        required: ["action"],
        additionalProperties: false,
      },
      async execute(input) {
        const { action, stacks: ids, overwrite = false } = (input ?? {}) as { action?: string; stacks?: unknown; overwrite?: boolean }
        return { content: await runInstall({ catalogue, installDir, action, ids, overwrite }) }
      },
    })

    editor.add({
      name: "rules_check",
      description:
        "Validate the rules installed in the project's `.opencode/rules/`: stack guide, check titles, lowercase globs, sources that exist, and check size. Run it after writing or editing rules.",
      input: { type: "object", properties: {}, additionalProperties: false },
      async execute() {
        const stacks = await loadRules(roots)
        if (stacks.length === 0) return { content: NO_STACKS_HINT }
        const errors = await validateRules(stacks)
        if (errors.length > 0) return { content: errors.join("\n") }
        return { content: `Rules OK: ${stacks.map((stack) => `${stack.id} (${stack.checks.length} checks)`).join(", ")}` }
      },
    })

    editor.add({
      name: "ocr_rules",
      description:
        "Manage the team rules in the repository's Open Code Review file `.opencodereview/rule.json`. `list` shows the available rule stacks and checks. `preview` returns the merged file without writing it. `apply` writes it. Always preview and get the user's confirmation before `apply`.",
      input: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["list", "preview", "apply"] },
          stacks: {
            type: "array",
            description: "Selected stacks for preview and apply.",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Stack ID from `list`." },
                root: {
                  type: "string",
                  description: "Application directory relative to the repository root; empty for the root.",
                },
              },
              required: ["id"],
              additionalProperties: false,
            },
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
      async execute(input) {
        const { action, stacks: selected } = (input ?? {}) as {
          action?: string
          stacks?: { id?: string; root?: string }[]
        }
        const stacks = await loadRules(roots)
        if (action === "list") return { content: renderStackList(stacks) || NO_STACKS_HINT }
        if (action !== "preview" && action !== "apply") return { content: "`action` must be list, preview, or apply." }
        if (!Array.isArray(selected) || selected.length === 0) {
          return { content: "`stacks` must list at least one { id, root } selection." }
        }

        const selections: OcrSelection[] = []
        for (const item of selected) {
          const stack = stacks.find((candidate) => candidate.id === item?.id && candidate.checks.length > 0)
          if (!stack) return { content: `Unknown rule stack: ${item?.id}` }
          try {
            selections.push({ stack, root: normalizeRoot(item.root) })
          } catch (error) {
            return { content: (error as Error).message }
          }
        }

        const directory = join(ctx.location.project?.directory ?? ctx.location.directory, ".opencodereview")
        const file = join(directory, "rule.json")
        let existing: string | undefined
        try {
          existing = await readFile(file, "utf8")
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
        }

        let result
        try {
          result = mergeOcrRules(existing, selections)
        } catch (error) {
          return { content: `Cannot update ${file}: ${(error as Error).message}` }
        }

        const warnings = result.warnings.map((warning) => `Warning: ${warning}`).join("\n")
        if (!result.changed) return { content: [`${file} is already up to date.`, warnings].filter(Boolean).join("\n") }
        if (action === "preview") {
          const status = existing === undefined ? "will be created" : "will be updated"
          return { content: [`${file} ${status}:`, warnings, "```json", result.content.trimEnd(), "```"].filter(Boolean).join("\n") }
        }

        await mkdir(directory, { recursive: true })
        await writeFile(file, result.content)
        return { content: [`Wrote ${file}.`, warnings].filter(Boolean).join("\n") }
      },
    })
  })

  await ctx.command.transform((editor) => {
    editor.add({
      name: "rules-install",
      description: "Install the plugin's engineering rules into this project's .opencode/rules/",
      async execute({ sessionID, prompt, delivery }) {
        await ctx.session.prompt({
          sessionID,
          text: RULES_INSTALL_PROMPT + (prompt.text?.trim() ? `\n\nUser input: ${prompt.text.trim()}` : ""),
          delivery,
        })
      },
    })

    editor.add({
      name: "ocr-rules",
      description: "Install or update the team rules in this repository's Open Code Review rule file",
      async execute({ sessionID, prompt, delivery }) {
        await ctx.session.prompt({
          sessionID,
          text: OCR_RULES_PROMPT + (prompt.text?.trim() ? `\n\nUser input: ${prompt.text.trim()}` : ""),
          delivery,
        })
      },
    })

    editor.add({
      name: "review",
      description: "Switch to the reviewer agent and review the current changes with Open Code Review",
      async execute({ sessionID, prompt, delivery }) {
        await ctx.session.switchAgent({ sessionID, agent: REVIEWER })
        await ctx.session.prompt({
          sessionID,
          text: `Review the current changes.${prompt.text?.trim() ? `\n\nUser input: ${prompt.text.trim()}` : ""}`,
          delivery,
        })
      },
    })
  })
}

const REVIEWER = "reviewer"

const REVIEW_DELEGATION = `## Code review
Code reviews with Open Code Review go through the \`reviewer\` agent. Do not run \`ocr\` or load the \`open-code-review-delegate\` skill yourself. When the user asks for a review, tell them to run \`/review\` (optionally with a branch range or commit) or to switch to the \`reviewer\` agent.`

const OCR_RULES_PROMPT = `Install or update the team rules for Open Code Review in this repository.

1. Call \`ocr_rules\` with action \`list\` and present the available stacks and their checks. If none are installed, tell the user to run \`/rules-install\` (or write their own rules) first, and stop.
2. Use the question tool to let the user select the stacks to install (several allowed). For each selected stack, ask for the application directory relative to the repository root, suggesting directories whose package.json depends on the stack's detect packages (ignore node_modules) and the root by default.
3. Call \`ocr_rules\` with action \`preview\`, show the user the entries that will be added or replaced and any warnings, then ask for explicit confirmation.
4. Only after confirmation, call \`ocr_rules\` with action \`apply\`.
5. Do not run \`ocr\` yourself. Suggest running \`/review\`, which uses the reviewer agent and the installed rules. Do not stage or commit the rule file.`

const RULES_INSTALL_PROMPT = `Install the plugin's engineering rules into this project.

1. Call \`rules_install\` with action \`list\` and present the bundled stacks, marking those already installed.
2. Use the question tool to let the user select the stacks to install (several allowed).
3. Call \`rules_install\` with action \`preview\`, show the files that will be created and those kept because they differ, then ask for explicit confirmation. Only offer \`overwrite\` if some files differ, and warn that local edits are lost.
4. Only after confirmation, call \`rules_install\` with action \`apply\` (with \`overwrite\` only if the user chose it).
5. Call \`rules_check\` and report the result. Suggest \`/ocr-rules\` so the review uses the same checks. Do not stage or commit the files.`

async function installAgents(ctx: Plugin.Context): Promise<void> {
  const option = ctx.options.agents
  const mode = option === "project" || option === "none" ? option : "global"
  if (mode === "none") return

  const source = join(ROOT, "agents")
  const configHome =
    process.env.XDG_CONFIG_HOME ??
    (process.platform === "win32" ? process.env.APPDATA : undefined) ??
    join(homedir(), ".config")
  const target =
    mode === "project"
      ? join(ctx.location.directory, ".opencode", "agents")
      : join(configHome, "opencode", "agents")

  let entries
  try {
    entries = await readdir(source, { withFileTypes: true })
  } catch (error) {
    console.warn(`${PREFIX} Could not read bundled agents`, error)
    return
  }

  try {
    await mkdir(target, { recursive: true })
  } catch (error) {
    console.error(`${PREFIX} Could not create agents directory "${target}"`, error)
    return
  }

  const installed: string[] = []

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue

    const path = join(target, entry.name)
    try {
      const bundled = await readFile(join(source, entry.name), "utf8")
      const current = await readFile(path, "utf8").catch(() => undefined)
      if (current === bundled) continue

      await writeFile(path, bundled)
      installed.push(entry.name)
    } catch (error) {
      console.error(`${PREFIX} Failed to install agent "${entry.name}"`, error)
    }
  }

  if (installed.length === 0) return

  console.info(`${PREFIX} Installed or updated agents in "${target}": ${installed.join(", ")}`)

  try {
    await ctx.agent.reload()
  } catch (error) {
    console.error(`${PREFIX} Installed agents but could not reload them`, error)
  }
}

export default Plugin.define({
  id: "signoff",
  async setup(ctx) {
    const skills = await loadSkills(ctx.location)

    await ctx.skill.transform((editor) => {
      for (const skill of skills) editor.add(skill)
    })

    try {
      await registerRules(ctx)
    } catch (error) {
      console.error(`${PREFIX} Failed to load engineering rules`, error)
    }

    try {
      await registerTools(ctx)
    } catch (error) {
      console.error(`${PREFIX} Failed to register bundled tools`, error)
    }

    let cleanup: Plugin.Cleanup | void = undefined

    try {
      cleanup = await ponytail.setup(ctx)
    } catch (error) {
      console.error(`${PREFIX} Failed to load ponytail`, error)
    }

    await installAgents(ctx)

    return cleanup
  },
})
