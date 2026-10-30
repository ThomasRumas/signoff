import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"

const SKILLS = fileURLToPath(new URL("../skills", import.meta.url))

test("every bundled skill has a description, and vendored skills keep their license", async () => {
  const entries = (await readdir(SKILLS, { withFileTypes: true })).filter((entry) => entry.isDirectory())
  assert.ok(entries.length > 0)

  for (const { name } of entries) {
    const raw = await readFile(join(SKILLS, name, "SKILL.md"), "utf8")
    const frontmatter = parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "")
    assert.ok(frontmatter?.description, `${name}: missing description`)

    const upstream = await readFile(join(SKILLS, name, "UPSTREAM.json"), "utf8").catch(() => undefined)
    if (upstream) {
      assert.ok(JSON.parse(upstream).license, `${name}: UPSTREAM.json has no license`)
      await readFile(join(SKILLS, name, "LICENSE"))
    }
  }
})
