import { execFile } from "node:child_process"
import { access, chmod, mkdir, readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { delimiter, dirname, join } from "node:path"
import { promisify } from "node:util"
import type { Plugin } from "@opencode/plugin"

const PREFIX = "[signoff]"
const TOOL_ENV = { CODEGRAPH_TELEMETRY: "0" }
const IS_WINDOWS = process.platform === "win32"
const run = promisify(execFile)
const require = createRequire(import.meta.url)

interface NativeCommand {
  command: string
  args: string[]
}

/** Directory of the per-platform package that a CLI installs as an optional dependency. */
function platformPackageDir(mainPackage: string, platformPackage: string): string {
  const mainRequire = createRequire(require.resolve(`${mainPackage}/package.json`))
  return dirname(mainRequire.resolve(`${platformPackage}-${process.platform}-${process.arch}/package.json`))
}

// Launch the self-contained platform builds directly: OpenCode's own executable is not a Node runtime.
async function resolveNative(name: string): Promise<NativeCommand | undefined> {
  try {
    let native: NativeCommand
    if (name === "codegraph") {
      const dir = platformPackageDir("@colbymchenry/codegraph", "@colbymchenry/codegraph")
      native = IS_WINDOWS
        ? {
            command: join(dir, "node.exe"),
            args: ["--liftoff-only", "--disable-warning=ExperimentalWarning", join(dir, "lib", "dist", "bin", "codegraph.js")],
          }
        : { command: join(dir, "bin", "codegraph"), args: [] }
    } else {
      const dir = platformPackageDir("@alibaba-group/open-code-review", "@alibaba-group/ocr")
      native = { command: join(dir, "bin", IS_WINDOWS ? "opencodereview.exe" : "opencodereview"), args: [] }
    }
    await access(native.command)
    return native
  } catch (error) {
    console.warn(`${PREFIX} Bundled "${name}" CLI is unavailable`, error)
  }
}

/** Writes `ocr`/`codegraph` launchers so agent shells can call the bundled CLIs by name. */
async function writeShims(commands: Record<string, NativeCommand | undefined>): Promise<string> {
  const cacheHome = process.env.XDG_CACHE_HOME ?? (IS_WINDOWS ? process.env.LOCALAPPDATA : undefined) ?? join(homedir(), ".cache")
  const dir = join(cacheHome, "opencode-signoff", "bin")
  await mkdir(dir, { recursive: true })

  for (const [name, native] of Object.entries(commands)) {
    if (!native) continue
    const argv = [native.command, ...native.args]
    const file = join(dir, IS_WINDOWS ? `${name}.cmd` : name)
    const content = IS_WINDOWS
      ? `@echo off\r\n${argv.map((arg) => `"${arg}"`).join(" ")} %*\r\n`
      : `#!/bin/sh\nexec ${argv.map((arg) => `'${arg.replaceAll("'", `'\\''`)}'`).join(" ")} "$@"\n`
    if ((await readFile(file, "utf8").catch(() => undefined)) !== content) {
      await writeFile(file, content)
      if (!IS_WINDOWS) await chmod(file, 0o755)
    }
  }
  return dir
}

export async function registerTools(ctx: Plugin.Context): Promise<void> {
  const codegraph = await resolveNative("codegraph")
  const ocr = await resolveNative("ocr")
  const binDir = await writeShims({ codegraph, ocr })
  const project = ctx.location.project?.directory ?? ctx.location.directory

  await ctx.shell.hook("create.before", (event) => {
    const current = event.env.PATH ?? process.env.PATH ?? ""
    event.env.PATH = [binDir, current].filter(Boolean).join(delimiter)
    Object.assign(event.env, TOOL_ENV)
  })

  if (!codegraph) return

  await ctx.mcp.transform((editor) => {
    editor.set("codegraph", {
      type: "local",
      command: [codegraph.command, ...codegraph.args, "serve", "--mcp"],
      cwd: project,
      environment: TOOL_ENV,
      codemode: false,
    })
  })

  const indexed = async () => {
    try {
      await access(join(project, ".codegraph"))
      return true
    } catch {
      return false
    }
  }

  await ctx.session.hook("context", async (event) => {
    event.system.push({
      type: "text",
      text: (await indexed())
        ? "## Code graph\nThis project has a CodeGraph index. To understand code structure, call flows, or the impact of a change, prefer the `codegraph_explore` tool (or `codegraph explore \"<question>\"` in the shell) over grep and reading files one by one."
        : "## Code graph\nThis project has no CodeGraph index yet. The `codegraph_init` tool (or the `/codegraph-init` command) builds it.",
    })
  })

  await ctx.tool.transform((editor) => {
    editor.add({
      name: "codegraph_init",
      description:
        "Check or build the project's CodeGraph index. `status` reports whether `.codegraph/` exists. `init` indexes the whole project, which can take minutes on large repositories; ask the user before running it.",
      input: {
        type: "object",
        properties: { action: { type: "string", enum: ["status", "init"] } },
        required: ["action"],
        additionalProperties: false,
      },
      async execute(input, context) {
        const action = (input as { action?: string })?.action
        if (action === "status") {
          return { content: (await indexed()) ? `CodeGraph index found in ${project}.` : `No CodeGraph index in ${project}.` }
        }
        if (action !== "init") return { content: "`action` must be status or init." }
        if (await indexed()) return { content: `CodeGraph is already initialized in ${project}; it syncs automatically.` }

        try {
          const { stdout } = await run(codegraph.command, [...codegraph.args, "init", "--yes", project], {
            cwd: project,
            env: { ...process.env, ...TOOL_ENV },
            signal: context.signal,
            maxBuffer: 10 * 1024 * 1024,
          })
          return { content: `CodeGraph initialized in ${project}.\n${stdout.trim().split("\n").slice(-10).join("\n")}` }
        } catch (error) {
          const { stderr, message } = error as { stderr?: string; message: string }
          return { content: `codegraph init failed: ${(stderr || message).trim()}` }
        }
      },
    })
  })

  await ctx.command.transform((editor) => {
    editor.add({
      name: "codegraph-init",
      description: "Build the CodeGraph index for this project",
      async execute({ sessionID, delivery }) {
        await ctx.session.prompt({
          sessionID,
          text: "Call the `codegraph_init` tool with action `init` to build this project's CodeGraph index, then report the result.",
          delivery,
        })
      },
    })
  })
}
