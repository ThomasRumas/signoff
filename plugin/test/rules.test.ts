import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { after, before, test } from "node:test"
import { fileURLToPath } from "node:url"
import {
  buildOcrRules,
  loadRules,
  matchRules,
  mergeOcrRules,
  renderIndex,
  renderMatches,
  runInstall,
  validateRules,
} from "../src/rules.ts"

const BUNDLED = fileURLToPath(new URL("../rules", import.meta.url))
let project: string

async function write(path: string, content: string) {
  await mkdir(dirname(join(project, path)), { recursive: true })
  await writeFile(join(project, path), content)
}

before(async () => {
  project = await mkdtemp(join(tmpdir(), "rules-test-"))
  await write("apps/api/package.json", JSON.stringify({ dependencies: { "@nestjs/core": "^11" } }))
  await write("apps/web/package.json", JSON.stringify({ dependencies: { vue: "^3" } }))
  await write(
    ".opencode/rules/nestjs/checks/03-controller.md",
    "---\ntitle: Project controller.\nglobs: [\"**/*.controller.ts\"]\nsources: [README.md]\n---\n- Project override.\n",
  )
  await write(".opencode/rules/project/checks/01-all.md", "---\ntitle: Project wide.\nglobs: [\"**/*\"]\n---\n- Always.\n")
})

after(async () => {
  await rm(project, { recursive: true, force: true })
})

async function match(paths: string[]) {
  const stacks = await loadRules([BUNDLED, join(project, ".opencode", "rules")])
  return matchRules(stacks, project, paths)
}

function ids(result: Awaited<ReturnType<typeof match>>) {
  return result.matches.map((entry) => `${entry.check.id}:${entry.paths.join(",")}`).sort()
}

test("selects stacks from the nearest package.json", async () => {
  const result = await match(["apps/api/src/users/users.service.ts", "apps/web/src/services/user.service.ts"])
  assert.deepEqual(ids(result), [
    "nestjs/05-service:apps/api/src/users/users.service.ts",
    "project/01-all:apps/api/src/users/users.service.ts,apps/web/src/services/user.service.ts",
    "vue/05-service:apps/web/src/services/user.service.ts",
  ])
})

test("applies the first matching check per stack", async () => {
  const result = await match(["apps/api/src/main.ts"])
  assert.deepEqual(ids(result), ["nestjs/01-entrypoint:apps/api/src/main.ts", "project/01-all:apps/api/src/main.ts"])
})

test("project checks override bundled checks with the same name", async () => {
  const result = await match(["apps/api/src/users/users.controller.ts"])
  const controller = result.matches.find((entry) => entry.check.id === "nestjs/03-controller")
  assert.equal(controller?.check.title, "Project controller.")
  assert.match(await renderMatches(result), /rules\/nestjs\/README\.md/)
})

test("ignores paths outside the project", async () => {
  const result = await match(["../elsewhere/main.ts"])
  assert.deepEqual(result.matches, [])
  assert.deepEqual(result.outside, ["../elsewhere/main.ts"])
})

test("matches paths case-insensitively like OCR", async () => {
  const result = await match(["apps/web/src/Composables/useCart.ts"])
  assert.ok(result.matches.some((entry) => entry.check.id === "vue/04-composable"))
})

test("builds OCR entries with the review marker and application root", async () => {
  const stacks = await loadRules([BUNDLED])
  const nestjs = stacks.find((stack) => stack.id === "nestjs")!
  const [first] = buildOcrRules(nestjs, "apps/api")
  assert.equal(first.path, "apps/api/**/main.ts")
  assert.match(first.rule, /^\[nestjs-best-practices\] Application entrypoint/)
  assert.equal(first.merge_system_rule, true)

  const vue = stacks.find((stack) => stack.id === "vue")!
  const store = buildOcrRules(vue, "apps/web").find((entry) => entry.rule.includes("Shared store"))
  assert.equal(store?.path, "{apps/web/**/stores/**/*.{ts,js},apps/web/**/*.store.{ts,js}}")
})

test("merges OCR rules after project entries and replaces previous team entries", async () => {
  const nestjs = (await loadRules([BUNDLED])).find((stack) => stack.id === "nestjs")!
  const existing = JSON.stringify({
    exclude: ["**/generated/**"],
    rules: [
      { path: "**/*", rule: "Project rule." },
      { path: "old/**", rule: "[nestjs-best-practices] Outdated." },
    ],
  })
  const { content, warnings, changed } = mergeOcrRules(existing, [{ stack: nestjs, root: "" }])
  const merged = JSON.parse(content)

  assert.equal(changed, true)
  assert.deepEqual(merged.exclude, ["**/generated/**"])
  assert.equal(merged.rules[0].rule, "Project rule.")
  assert.equal(merged.rules.length, 1 + nestjs.checks.length)
  assert.ok(!content.includes("Outdated"))
  assert.equal(warnings.length, 1)
  assert.equal(mergeOcrRules(content, [{ stack: nestjs, root: "" }]).changed, false)
})

test("installs a bundled stack without overwriting local edits", async () => {
  const installDir = join(project, "installed", ".opencode", "rules")
  const request = { catalogue: BUNDLED, installDir, ids: ["nestjs"], overwrite: false }

  assert.match(await runInstall({ ...request, action: "list" }), /nestjs .*\[not installed\]/)
  assert.match(await runInstall({ ...request, action: "preview" }), /nestjs: [1-9]\d* to create, 0 identical, 0 differing/)

  await runInstall({ ...request, action: "apply" })
  const check = join(installDir, "nestjs", "checks", "03-controller.md")
  const bundled = await readFile(join(BUNDLED, "nestjs", "checks", "03-controller.md"), "utf8")
  assert.equal(await readFile(check, "utf8"), bundled)
  assert.match(await runInstall({ ...request, action: "list" }), /nestjs .*\[installed\]/)

  await writeFile(check, "local edit")
  assert.match(await runInstall({ ...request, action: "apply" }), /Kept 1 file/)
  assert.equal(await readFile(check, "utf8"), "local edit")

  await runInstall({ ...request, action: "apply", overwrite: true })
  assert.equal(await readFile(check, "utf8"), bundled)
})

test("rejects unknown stacks and path traversal in rules_install", async () => {
  const installDir = join(project, "never", ".opencode", "rules")
  const request = { catalogue: BUNDLED, installDir, action: "apply", overwrite: false }
  assert.match(await runInstall({ ...request, ids: ["../etc"] }), /Unknown bundled rule stack/)
  assert.match(await runInstall({ ...request, ids: [] }), /at least one stack/)
})

test("renders no index when no stack is installed", () => {
  assert.equal(renderIndex([]), "")
})

test("validates project rules", async () => {
  await write(".opencode/rules/broken/README.md", "---\ndescription: Broken stack.\n---\n# Broken\n")
  await write(".opencode/rules/broken/checks/01-bad.md", "---\ntitle: Bad.\nglobs: [\"**/*.TS\"]\nsources: [missing.md]\n---\n- x\n")
  const stacks = (await loadRules([join(project, ".opencode", "rules")])).filter((stack) => stack.id === "broken")
  const errors = await validateRules(stacks)
  assert.equal(errors.length, 2)
  assert.ok(errors.some((error) => error.includes("uppercase")))
  assert.ok(errors.some((error) => error.includes("source not found")))
})
