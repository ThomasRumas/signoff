import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import type { DefaultTheme } from "vitepress"
import { withMermaid } from "vitepress-plugin-mermaid"

const rulesDir = fileURLToPath(new URL("../../../plugin/rules", import.meta.url))

function pageTitle(file: string): string {
  const text = readFileSync(file, "utf8")
  const title = /^title:\s*(.+)$/m.exec(text)?.[1] ?? /^#\s+(.+)$/m.exec(text)?.[1] ?? file
  return title.replace(/^(Rule|Decision|ADR[- \d]*):\s*/i, "").replace(/\.$/, "")
}

function ruleItems(stack: string, dir: string): DefaultTheme.SidebarItem[] {
  const items: DefaultTheme.SidebarItem[] = []
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name)
    const link = `/rules/${stack}/${relative(join(rulesDir, stack), path).replace(/\.md$/, "")}`
    if (statSync(path).isDirectory()) {
      const hasReadme = readdirSync(path).includes("README.md")
      items.push({
        text: name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()),
        link: hasReadme ? `${link}/README` : undefined,
        collapsed: true,
        items: ruleItems(stack, path),
      })
    } else if (name.endsWith(".md") && name !== "README.md") {
      items.push({ text: pageTitle(path), link })
    }
  }
  return items
}

function rulesSidebar(): DefaultTheme.SidebarItem[] {
  return readdirSync(rulesDir)
    .filter((stack) => statSync(join(rulesDir, stack)).isDirectory())
    .map((stack) => ({
      text: stack === "nestjs" ? "NestJS" : stack === "vue" ? "Vue" : stack,
      link: `/rules/${stack}/README`,
      collapsed: false,
      items: ruleItems(stack, join(rulesDir, stack)),
    }))
}

const docsSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "Getting started",
    items: [
      { text: "Introduction", link: "/getting-started/introduction" },
      { text: "Why it matters", link: "/getting-started/why" },
      { text: "Quick start", link: "/getting-started/installation" },
      { text: "Tutorial: your first feature", link: "/getting-started/first-feature" },
    ],
  },
  {
    text: "Essentials",
    items: [
      { text: "Workflow", link: "/concepts/workflow" },
      { text: "Acceptance criteria", link: "/concepts/acceptance" },
      { text: "Project memory", link: "/concepts/memory" },
      { text: "Subagents", link: "/concepts/subagents" },
    ],
  },
  {
    text: "Engineering rules",
    items: [
      { text: "Overview", link: "/concepts/engineering-rules" },
      { text: "Install the plugin's rules", link: "/guides/install-rules" },
      { text: "Write your own rules", link: "/guides/write-your-own-rules" },
      { text: "Customize the rules", link: "/guides/customize-rules" },
      { text: "Rules catalogue", link: "/rules/" },
    ],
  },
  {
    text: "Review and quality",
    items: [
      { text: "Code review", link: "/guides/code-review" },
      { text: "Review rules (OCR)", link: "/guides/ocr-rules" },
    ],
  },
  {
    text: "Knowledge",
    items: [
      { text: "Documentation agent", link: "/guides/documentation" },
      { text: "CodeGraph", link: "/guides/codegraph" },
    ],
  },
  {
    text: "Adoption",
    items: [
      { text: "Ways of using it", link: "/adoption/ways-of-using" },
      { text: "Onboarding a team", link: "/adoption/onboarding-a-team" },
      { text: "Adapting the method", link: "/adoption/adapting-the-method" },
    ],
  },
  {
    text: "Reference",
    items: [
      { text: "Agents", link: "/reference/agents" },
      { text: "Commands", link: "/reference/commands" },
      { text: "Tools", link: "/reference/tools" },
      { text: "Skills", link: "/reference/skills" },
      { text: "Configuration", link: "/reference/configuration" },
    ],
  },
  {
    text: "Help",
    items: [
      { text: "Troubleshooting", link: "/troubleshooting" },
      { text: "FAQ", link: "/faq" },
      { text: "Changelog", link: "/changelog" },
    ],
  },
]

const pagesBasePath = process.env.PAGES_BASE_PATH ?? ""
const base = pagesBasePath ? `${pagesBasePath.replace(/\/$/, "")}/` : "/"

export default withMermaid({
  lang: "en-US",
  title: "Signoff",
  description: "You own what ships. AI writes the code; you keep the decisions.",
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: `${base}favicon.svg` }],
    ["meta", { name: "theme-color", content: "#0f2742" }],
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/getting-started/introduction", activeMatch: "^/(getting-started/(?!why)|concepts/|guides/|adoption/)" },
      { text: "Rules", link: "/rules/", activeMatch: "^/rules/" },
      { text: "Reference", link: "/reference/agents", activeMatch: "^/reference/" },
      { text: "Why", link: "/getting-started/why" },
    ],
    sidebar: {
      "/rules/": [{ text: "Rules catalogue", link: "/rules/" }, ...rulesSidebar()],
      "/": docsSidebar,
    },
    search: { provider: "local" },
    outline: [2, 3],
    footer: {
      message: "You own what ships.",
    },
  },
  mermaid: {},
  // Mermaid 11 imports CommonJS fastdom, which vitepress-plugin-mermaid does not pre-bundle.
  vite: { optimizeDeps: { include: ["fastdom", "fastdom/extensions/fastdom-promised.js"] } },
})
