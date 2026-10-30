import { copyFile, mkdir, readdir, readFile, realpath, stat } from "node:fs/promises"
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import picomatch from "picomatch"
import { parse } from "yaml"

export interface RuleCheck {
  id: string
  title: string
  globs: string[]
  body: string
  sources: string[]
  file: string
}

export interface RuleStack {
  id: string
  description?: string
  detect: string[]
  reviewMarker: string
  guide?: string
  checks: RuleCheck[]
  /** Stack directories, highest precedence first. */
  dirs: string[]
}

export interface RuleMatch {
  stack: RuleStack
  check: RuleCheck
  paths: string[]
}

interface StackFrontmatter {
  description?: string
  detect?: string[]
  "review-marker"?: string
}

interface CheckFrontmatter {
  title?: string
  globs?: string[]
  sources?: string[]
}

function splitFrontmatter<T>(raw: string): { data: T | undefined; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  return {
    data: match ? (parse(match[1]) as T) : undefined,
    body: (match ? raw.slice(match[0].length) : raw).trim(),
  }
}

async function listEntries(directory: string) {
  try {
    return await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await readFile(path)
    return true
  } catch {
    return false
  }
}

/** Loads rule stacks from `roots`, ordered from lowest to highest precedence. */
export async function loadRules(roots: string[]): Promise<RuleStack[]> {
  const seen = new Set<string>()
  // stack id -> stack directories, lowest precedence first
  const stackDirs = new Map<string, string[]>()

  for (const root of roots) {
    let source
    try {
      source = await realpath(root)
    } catch {
      continue
    }
    if (seen.has(source)) continue
    seen.add(source)

    for (const entry of await listEntries(source)) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue
      const dirs = stackDirs.get(entry.name) ?? []
      dirs.push(join(source, entry.name))
      stackDirs.set(entry.name, dirs)
    }
  }

  const stacks: RuleStack[] = []
  for (const [id, lowFirst] of [...stackDirs].sort(([a], [b]) => a.localeCompare(b))) {
    stacks.push(await loadStack(id, [...lowFirst].reverse()))
  }
  return stacks
}

async function loadStack(id: string, dirs: string[]): Promise<RuleStack> {
  let guide: string | undefined
  let frontmatter: StackFrontmatter | undefined
  for (const dir of dirs) {
    const path = join(dir, "README.md")
    if (!(await exists(path))) continue
    guide = path
    frontmatter = splitFrontmatter<StackFrontmatter>(await readFile(path, "utf8")).data
    break
  }

  // check file name -> absolute path, highest precedence wins
  const files = new Map<string, string>()
  for (const dir of dirs) {
    for (const entry of await listEntries(join(dir, "checks"))) {
      if (!entry.isFile() || !entry.name.endsWith(".md") || files.has(entry.name)) continue
      files.set(entry.name, join(dir, "checks", entry.name))
    }
  }

  const checks: RuleCheck[] = []
  for (const name of [...files.keys()].sort()) {
    const file = files.get(name)!
    const { data, body } = splitFrontmatter<CheckFrontmatter>(await readFile(file, "utf8"))
    checks.push({
      id: `${id}/${name.slice(0, -".md".length)}`,
      title: data?.title ?? "",
      globs: Array.isArray(data?.globs) ? data.globs : [],
      sources: Array.isArray(data?.sources) ? data.sources : [],
      body,
      file,
    })
  }

  return {
    id,
    description: frontmatter?.description,
    detect: Array.isArray(frontmatter?.detect) ? frontmatter.detect : [],
    reviewMarker: frontmatter?.["review-marker"] ?? id,
    guide,
    checks,
    dirs,
  }
}

/** Resolves a stack-relative source to the highest-precedence existing file. */
export async function resolveSource(stack: RuleStack, source: string): Promise<string | undefined> {
  for (const dir of stack.dirs) {
    const path = resolve(dir, source)
    if (!path.startsWith(dir + sep)) return
    if (await exists(path)) return path
  }
}

async function readDependencies(packageJson: string): Promise<Set<string> | undefined> {
  try {
    const manifest = JSON.parse(await readFile(packageJson, "utf8"))
    return new Set([
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
    ])
  } catch {
    return
  }
}

/** Dependencies of the nearest package.json between the file and the project root. */
async function nearestDependencies(
  projectDir: string,
  file: string,
  cache: Map<string, Set<string> | undefined>,
): Promise<Set<string> | undefined> {
  const visited: string[] = []
  let dir = dirname(file)
  let found: Set<string> | undefined

  while (true) {
    if (cache.has(dir)) {
      found = cache.get(dir)
      break
    }
    visited.push(dir)
    found = await readDependencies(join(dir, "package.json"))
    if (found || dir === projectDir) break
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  for (const path of visited) cache.set(path, found)
  return found
}

/** Returns the first matching check per applicable stack, grouped by check. */
export async function matchRules(stacks: RuleStack[], projectDir: string, paths: string[]) {
  const matches = new Map<string, RuleMatch>()
  const unmatched: string[] = []
  const outside: string[] = []
  const cache = new Map<string, Set<string> | undefined>()
  const matchers = new Map(
    stacks.flatMap((stack) =>
      stack.checks.filter((check) => check.globs.length > 0).map((check) => [check, picomatch(check.globs)] as const),
    ),
  )

  for (const input of paths) {
    const absolute = resolve(projectDir, input)
    const rel = relative(projectDir, absolute)
    if (!rel || rel.startsWith("..") || isAbsolute(rel)) {
      outside.push(input)
      continue
    }
    const posix = rel.split(sep).join("/")
    // OCR lowercases paths before matching, so rules_for does the same.
    const key = posix.toLowerCase()
    const dependencies = await nearestDependencies(projectDir, absolute, cache)

    let matched = false
    for (const stack of stacks) {
      if (stack.detect.length > 0 && !stack.detect.some((name) => dependencies?.has(name))) continue
      const check = stack.checks.find((candidate) => matchers.get(candidate)?.(key))
      if (!check) continue
      matched = true
      const match = matches.get(check.id) ?? { stack, check, paths: [] }
      match.paths.push(posix)
      matches.set(check.id, match)
    }
    if (!matched) unmatched.push(posix)
  }

  return { matches: [...matches.values()], unmatched, outside }
}

export async function renderMatches(result: Awaited<ReturnType<typeof matchRules>>): Promise<string> {
  const lines: string[] = []

  for (const { stack, check, paths } of result.matches) {
    lines.push(`## ${check.id}: ${check.title}`, `Files: ${paths.join(", ")}`, "", check.body, "")
    const sources = await Promise.all(check.sources.map((source) => resolveSource(stack, source)))
    const resolved = sources.filter((source): source is string => Boolean(source))
    if (resolved.length > 0) {
      lines.push("Sources (read only those whose decisions the change touches):")
      for (const source of resolved) lines.push(`- ${source}`)
      lines.push("")
    }
  }

  if (result.unmatched.length > 0) lines.push(`No rules matched: ${result.unmatched.join(", ")}`)
  if (result.outside.length > 0) lines.push(`Ignored, outside the project: ${result.outside.join(", ")}`)
  return lines.join("\n").trim() || "No rules matched."
}

export function renderIndex(stacks: RuleStack[]): string {
  if (stacks.length === 0) return ""
  const lines = [
    "## Team engineering rules",
    "Engineering rules are Markdown files grouped by stack, installed in the project's `.opencode/rules/<stack>/`.",
    "",
  ]
  for (const stack of stacks) {
    const scope = stack.detect.length > 0 ? `projects depending on ${stack.detect.join(" or ")}` : "every project"
    lines.push(`- ${stack.id} (${scope}): ${stack.description ?? "no description"}${stack.guide ? ` Guide: ${stack.guide}` : ""}`)
  }
  lines.push(
    "",
    "Before planning, editing, or reviewing code, call the `rules_for` tool with the target file paths. Apply the returned checks, read only the cited sources whose decisions the change touches, and state any deliberate deviation.",
  )
  return lines.join("\n")
}

/** Splits `{a,b}` at top-level commas; returns undefined when the glob is not one brace group. */
function splitAlternatives(glob: string): string[] | undefined {
  if (!glob.startsWith("{") || !glob.endsWith("}")) return
  const parts: string[] = []
  let depth = 0
  let start = 1
  for (let i = 1; i < glob.length - 1; i++) {
    const char = glob[i]
    if (char === "{") depth++
    else if (char === "}" && --depth < 0) return
    else if (char === "," && depth === 0) {
      parts.push(glob.slice(start, i))
      start = i + 1
    }
  }
  parts.push(glob.slice(start, -1))
  return depth === 0 ? parts : undefined
}

function prefixGlob(glob: string, root: string): string {
  if (!root) return glob
  const alternatives = splitAlternatives(glob)
  if (alternatives) return `{${alternatives.map((part) => `${root}/${part}`).join(",")}}`
  return `${root}/${glob}`
}

/** Normalizes a repository-relative application directory; throws on paths outside the repository. */
export function normalizeRoot(root: string | undefined): string {
  const value = (root ?? "").replace(/\\/g, "/").replace(/^\.\/?/, "").replace(/\/+$/, "")
  if (value.startsWith("/") || /^[a-z]:/i.test(value) || value.split("/").includes("..")) {
    throw new Error(`Application directory must be relative to the repository: ${root}`)
  }
  return value.toLowerCase()
}

export interface OcrRule {
  path: string
  rule: string
  merge_system_rule?: boolean
}

export function buildOcrRules(stack: RuleStack, root = ""): OcrRule[] {
  return stack.checks.map((check) => ({
    path: prefixGlob(check.globs.length === 1 ? check.globs[0] : `{${check.globs.join(",")}}`, root),
    rule: `[${stack.reviewMarker}] ${check.title}\n${check.body}\nSources: ${check.sources.join(", ")}`,
    merge_system_rule: true,
  }))
}

export interface OcrSelection {
  stack: RuleStack
  root: string
}

const CATCH_ALL = /^\*\*(\/\*(\.(\w+|\{[\w,]+\}))?)?$/

/** Replaces the selected stacks' entries in an OCR rule file, keeping every other entry first. */
export function mergeOcrRules(existing: string | undefined, selections: OcrSelection[]) {
  const config = existing?.trim() ? JSON.parse(existing) : {}
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    throw new Error("rule.json must contain a JSON object")
  }
  if (config.rules !== undefined && !Array.isArray(config.rules)) {
    throw new Error("rule.json `rules` must be an array")
  }

  const markers = selections.map(({ stack }) => `[${stack.reviewMarker}]`)
  const kept = ((config.rules ?? []) as OcrRule[]).filter(
    (entry) => !markers.some((marker) => typeof entry?.rule === "string" && entry.rule.startsWith(marker)),
  )
  const added = selections.flatMap(({ stack, root }) => buildOcrRules(stack, root))

  const warnings: string[] = []
  for (const entry of kept) {
    if (typeof entry?.path === "string" && CATCH_ALL.test(entry.path)) {
      warnings.push(`Existing entry "${entry.path}" comes first and shadows the team rules for the files it matches.`)
    }
  }
  const roots = selections.map(({ root }) => root)
  for (const [index, { stack, root }] of selections.entries()) {
    if (roots.indexOf(root) !== index) {
      warnings.push(`${stack.id} shares the directory "${root || "."}" with another stack; the first stack's broad globs shadow it.`)
    }
  }

  const content = `${JSON.stringify({ ...config, rules: [...kept, ...added] }, null, 2)}\n`
  return { content, warnings, changed: content !== existing }
}

export function renderStackList(stacks: RuleStack[]): string {
  return stacks
    .filter((stack) => stack.checks.length > 0)
    .map((stack) => {
      const detect = stack.detect.length > 0 ? ` (detect: ${stack.detect.join(", ")})` : ""
      const checks = stack.checks.map((check) => `  - ${check.id}: ${check.title} [${check.globs.join(", ")}]`)
      return [`- ${stack.id}${detect}: ${stack.description ?? "no description"}`, ...checks].join("\n")
    })
    .join("\n")
}

export const NO_STACKS_HINT =
  "No rule stacks are installed in this project. `/rules-install` installs the plugin's rules; the `author-engineering-rules` skill writes new ones."

export interface InstallPlan {
  create: string[]
  identical: string[]
  differing: string[]
}

async function listFiles(dir: string, prefix = ""): Promise<string[]> {
  const files: string[] = []
  for (const entry of await listEntries(join(dir, prefix))) {
    if (entry.name.startsWith(".")) continue
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...(await listFiles(dir, rel)))
    else if (entry.isFile()) files.push(rel)
  }
  return files.sort()
}

/** Compares a bundled stack directory with its installed copy. */
export async function planInstall(source: string, target: string): Promise<InstallPlan> {
  const plan: InstallPlan = { create: [], identical: [], differing: [] }
  for (const file of await listFiles(source)) {
    const bundled = await readFile(join(source, file), "utf8")
    const current = await readFile(join(target, file), "utf8").catch(() => undefined)
    if (current === undefined) plan.create.push(file)
    else if (current === bundled) plan.identical.push(file)
    else plan.differing.push(file)
  }
  return plan
}

/** Copies missing files, and differing ones when `overwrite` is set. Returns the written files. */
export async function applyInstall(source: string, target: string, plan: InstallPlan, overwrite: boolean): Promise<string[]> {
  const files = overwrite ? [...plan.create, ...plan.differing] : plan.create
  for (const file of files) {
    await mkdir(dirname(join(target, file)), { recursive: true })
    await copyFile(join(source, file), join(target, file))
  }
  return files
}

export async function isInstalled(rulesDir: string, id: string): Promise<boolean> {
  try {
    return (await stat(join(rulesDir, id))).isDirectory()
  } catch {
    return false
  }
}

export function renderCatalogue(stacks: RuleStack[], installed: Set<string>): string {
  return stacks
    .map((stack) => {
      const detect = stack.detect.length > 0 ? ` (detect: ${stack.detect.join(", ")})` : ""
      const status = installed.has(stack.id) ? "installed" : "not installed"
      return `- ${stack.id}${detect} [${status}]: ${stack.description ?? "no description"}${stack.guide ? ` Guide: ${stack.guide}` : ""}`
    })
    .join("\n")
}

export function renderInstallPlan(id: string, plan: InstallPlan, overwrite: boolean): string {
  const lines = [`${id}: ${plan.create.length} to create, ${plan.identical.length} identical, ${plan.differing.length} differing`]
  const section = (title: string, files: string[]) => {
    if (files.length > 0) lines.push(`  ${title}:`, ...files.map((file) => `    - ${file}`))
  }
  section("Create", plan.create)
  section(overwrite ? "Overwrite (local edits lost)" : "Kept as is (differ from the plugin's version)", plan.differing)
  return lines.join("\n")
}

export interface InstallRequest {
  catalogue: string
  installDir: string
  action?: string
  ids?: unknown
  overwrite: boolean
}

/** Backs the `rules_install` tool: lists the bundled stacks, previews or applies their installation. */
export async function runInstall({ catalogue, installDir, action, ids, overwrite }: InstallRequest): Promise<string> {
  const bundled = await loadRules([catalogue])

  if (action === "list") {
    const installed = new Set<string>()
    for (const stack of bundled) if (await isInstalled(installDir, stack.id)) installed.add(stack.id)
    return renderCatalogue(bundled, installed) || "No bundled rule stacks."
  }
  if (action !== "preview" && action !== "apply") return "`action` must be list, preview, or apply."
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
    return "`stacks` must list at least one stack ID."
  }

  const selected: RuleStack[] = []
  for (const id of new Set<string>(ids)) {
    const stack = bundled.find((candidate) => candidate.id === id)
    if (!stack) return `Unknown bundled rule stack: ${id}`
    selected.push(stack)
  }

  const lines: string[] = []
  for (const stack of selected) {
    const source = stack.dirs[0]
    const target = join(installDir, stack.id)
    const plan = await planInstall(source, target)
    if (action === "preview") {
      lines.push(renderInstallPlan(stack.id, plan, overwrite))
      continue
    }
    const written = await applyInstall(source, target, plan, overwrite)
    lines.push(`${stack.id}: wrote ${written.length} file(s) to ${target}.`)
    if (!overwrite && plan.differing.length > 0) {
      lines.push(`  Kept ${plan.differing.length} file(s) that differ; use overwrite to replace them.`)
    }
  }
  return lines.join("\n")
}

const MAX_CHECK_LINES = 40

export async function validateRules(stacks: RuleStack[]): Promise<string[]> {
  const errors: string[] = []

  for (const stack of stacks) {
    if (!stack.guide) errors.push(`${stack.id}: missing README.md`)
    else if (!stack.description) errors.push(`${stack.id}: README.md has no description`)

    for (const check of stack.checks) {
      if (!check.title) errors.push(`${check.id}: missing title`)
      if (check.globs.length === 0) errors.push(`${check.id}: missing globs`)
      for (const glob of check.globs) {
        if (/[A-Z]/.test(glob)) errors.push(`${check.id}: glob "${glob}" has uppercase letters; OCR matches lowercased paths`)
      }
      if (!check.body) errors.push(`${check.id}: empty body`)
      if (check.body.split("\n").length > MAX_CHECK_LINES) {
        errors.push(`${check.id}: body exceeds ${MAX_CHECK_LINES} lines; link a source instead`)
      }
      for (const source of check.sources) {
        if (!(await resolveSource(stack, source))) errors.push(`${check.id}: source not found: ${source}`)
      }
    }
  }

  return errors
}
