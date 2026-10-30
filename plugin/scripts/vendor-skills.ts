import { cp, mkdtemp, rm, writeFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

interface VendoredSkill {
  id: string
  repo: string
  ref: string
  path: string
  license: string
  licenseFiles: string[]
  exclude?: RegExp
}

const SKILLS: VendoredSkill[] = [
  {
    id: "open-code-review-delegate",
    repo: "alibaba/open-code-review",
    ref: "375f64cd6f67a48a135da83cfcf59c52669a09cb",
    path: "skills/open-code-review-delegate",
    license: "Apache-2.0",
    licenseFiles: ["LICENSE"],
  },
  {
    id: "grill-me",
    repo: "mattpocock/skills",
    ref: "5beb35b040e3de97e54fa9e386d7e42d15c295c2",
    path: "skills/productivity/grill-me",
    license: "MIT",
    licenseFiles: ["LICENSE"],
  },
  {
    id: "grilling",
    repo: "mattpocock/skills",
    ref: "5beb35b040e3de97e54fa9e386d7e42d15c295c2",
    path: "skills/productivity/grilling",
    license: "MIT",
    licenseFiles: ["LICENSE"],
  },
  {
    id: "cyclomatic-complexity",
    repo: "saurabhkumar8112/cyclomatic-complexity-skill",
    ref: "567886f485063c5f5f94503d5712ef75cbcbbd94",
    path: "skills/cyclomatic-complexity",
    license: "Apache-2.0",
    licenseFiles: ["LICENSE"],
  },
  {
    id: "archify",
    repo: "tt-a1i/archify",
    ref: "81c6be8d87090670c45d08a8f97f9d29c5af0bec",
    path: "archify",
    license: "Apache-2.0",
    licenseFiles: ["LICENSE", "NOTICE", "THIRD_PARTY_NOTICES.md"],
    // Rendered gallery pages (~13 MB); the skill only references the JSON examples.
    exclude: /^examples\/.*\.html$/,
  },
]

const SKILLS_DIR = fileURLToPath(new URL("../skills", import.meta.url))

function git(cwd: string, ...args: string[]) {
  execFileSync("git", args, { cwd, stdio: ["ignore", "ignore", "inherit"] })
}

const work = await mkdtemp(join(tmpdir(), "vendor-skills-"))
const checkouts = new Map<string, string>()

try {
  for (const skill of SKILLS) {
    const key = `${skill.repo}@${skill.ref}`
    let checkout = checkouts.get(key)
    if (!checkout) {
      checkout = join(work, String(checkouts.size))
      execFileSync("git", ["init", "-q", checkout])
      git(checkout, "fetch", "-q", "--depth", "1", `https://github.com/${skill.repo}.git`, skill.ref)
      git(checkout, "checkout", "-q", "FETCH_HEAD")
      checkouts.set(key, checkout)
    }

    const source = join(checkout, skill.path)
    const target = join(SKILLS_DIR, skill.id)
    await rm(target, { recursive: true, force: true })
    await cp(source, target, {
      recursive: true,
      filter: (path) => !skill.exclude?.test(relative(source, path).split("\\").join("/")),
    })
    for (const file of skill.licenseFiles) {
      await cp(join(checkout, file), join(target, file), { force: false, errorOnExist: false })
    }
    const upstream = { repository: `https://github.com/${skill.repo}`, ref: skill.ref, path: skill.path, license: skill.license }
    await writeFile(join(target, "UPSTREAM.json"), `${JSON.stringify(upstream, null, 2)}\n`)
    console.log(`Vendored ${skill.id} from ${skill.repo}@${skill.ref.slice(0, 7)}`)
  }
} finally {
  await rm(work, { recursive: true, force: true })
}
