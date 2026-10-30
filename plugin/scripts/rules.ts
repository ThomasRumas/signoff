import { fileURLToPath } from "node:url"
import { loadRules, validateRules } from "../src/rules.ts"

const RULES = fileURLToPath(new URL("../rules", import.meta.url))
const stacks = await loadRules([RULES])
const errors = await validateRules(stacks)

for (const error of errors) console.error(error)
if (errors.length > 0) process.exit(1)
console.log(`Rules OK: ${stacks.map((stack) => `${stack.id} (${stack.checks.length} checks)`).join(", ")}`)
