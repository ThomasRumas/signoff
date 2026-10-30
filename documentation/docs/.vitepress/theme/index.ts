import "@fontsource-variable/archivo/wdth.css"
import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import Landing from "./components/landing/Landing.vue"
import RuleStats from "./components/RuleStats.vue"
import StatGrid from "./components/StatGrid.vue"
import "./style.css"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Landing", Landing)
    app.component("RuleStats", RuleStats)
    app.component("StatGrid", StatGrid)
  },
} satisfies Theme
