// Mirrors the plugin rules into docs/rules/<stack>/ so the catalogue never diverges from its source.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "..", "plugin", "rules")
const target = join(root, "docs", "rules")

async function* markdownFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* markdownFiles(path)
    else if (entry.name.endsWith(".md")) yield path
  }
}

function renderCheck(text: string): string {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text)
  if (!match) return text
  const meta = parse(match[1]) as { title?: string; globs?: string[]; sources?: string[] }
  const lines = [`# ${meta.title?.replace(/\.$/, "") ?? "Check"}`, ""]
  if (meta.globs?.length) {
    lines.push("**Applies to:** " + meta.globs.map((glob) => "`" + glob + "`").join(", "), "")
  }
  lines.push("## Checklist", "", match[2].trim(), "")
  if (meta.sources?.length) {
    lines.push("## Sources", "", ...meta.sources.map((path) => `- [${path}](../${path})`), "")
  }
  return lines.join("\n")
}

await mkdir(target, { recursive: true })
for (const entry of await readdir(target)) {
  if (entry !== "index.md") await rm(join(target, entry), { recursive: true, force: true })
}

let count = 0
for (const stack of await readdir(source, { withFileTypes: true })) {
  if (!stack.isDirectory()) continue
  const stackDir = join(source, stack.name)
  for await (const file of markdownFiles(stackDir)) {
    const rel = relative(stackDir, file)
    const out = join(target, stack.name, rel)
    const text = await readFile(file, "utf8")
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, rel.startsWith("checks/") ? renderCheck(text) : text)
    count++
  }
}

console.log(`Generated ${count} rule pages in ${relative(root, target)}`)
