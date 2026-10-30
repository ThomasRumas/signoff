import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

export interface StackStats {
  id: string
  checks: number
  documents: number
}

declare const data: StackStats[]
export { data }

const rulesDir = fileURLToPath(new URL("../../../../plugin/rules", import.meta.url))

function countMarkdown(dir: string): number {
  return readdirSync(dir).reduce((total, name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return total + countMarkdown(path)
    return total + (name.endsWith(".md") ? 1 : 0)
  }, 0)
}

export default {
  watch: ["../../../../plugin/rules/**/*.md"],
  load(): StackStats[] {
    return readdirSync(rulesDir)
      .filter((id) => statSync(join(rulesDir, id)).isDirectory())
      .map((id) => {
        const stack = join(rulesDir, id)
        const documents = ["architecture", "engineering-rules"]
          .map((dir) => join(stack, dir))
          .reduce((total, dir) => total + countMarkdown(dir), 0)
        return { id, checks: countMarkdown(join(stack, "checks")), documents }
      })
  },
}
