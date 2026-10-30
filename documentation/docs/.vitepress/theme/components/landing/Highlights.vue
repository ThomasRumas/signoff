<script setup lang="ts">
import { ref } from "vue"

const tabs = [
  {
    id: "approve",
    label: "Approve",
    title: "Nothing is coded before you approve the spec.",
    text: "Each feature gets a written spec with acceptance criteria, edge cases, exact paths and applied rules. Only your explicit Approve unlocks implementation.",
    href: "#control",
    sample: `# 001: Paginate the user list

## Acceptance
- AC-1: Given 45 users, when GET /users?page=2,
  then 20 users and pagination metadata are returned.

## Edge Cases
- EC-1: pageSize above 100 -> 400 INVALID_PAGE_SIZE

? Approve this spec        [Approve]  [Request changes]`,
  },
  {
    id: "verify",
    label: "Verify",
    title: "Every criterion checked, with evidence.",
    text: "A separate agent verifies each acceptance criterion and edge case against the code and the tests. Gaps are reported, not hidden.",
    href: "#control",
    sample: `## Refactoring Report
AC-1  users.controller.spec.ts "returns page 2"     PASS
AC-2  users.controller.spec.ts "defaults to page 1" PASS
EC-1  page.query.spec.ts "rejects pageSize > 100"   PASS
Rules nestjs/03-controller                          PASS
Status: PASS`,
  },
  {
    id: "rules",
    label: "Rules",
    title: "Your conventions, served file by file.",
    text: "Team rules live in your repository. Agents receive only the checks that match the files they touch, with the reasoning behind each one.",
    href: "#rules",
    sample: `rules_for(["src/users/users.controller.ts"])

nestjs  03-controller  NestJS controller (transport boundary)
  - Keep handlers thin
  - Responses MUST be project-owned response DTOs
  - Collection endpoints use the shared paginator
  sources: design/001, observability/002, pagination/001`,
  },
  {
    id: "review",
    label: "Review",
    title: "A first review before yours.",
    text: "/review applies the same team rules with Open Code Review, covers every changed file, and proposes a fix plan you approve.",
    href: "#job",
    sample: `/review main..HEAD

Coverage   12 of 12 changed files reviewed
Findings   1 major, 2 minor
  major  users.service.ts:42  Raw Prisma entity returned
Fix plan   3 steps, waiting for your approval`,
  },
  {
    id: "memory",
    label: "Memory",
    title: "The next session starts where you stopped.",
    text: "Requirements, features, statuses and archived specs stay in the project. No re-briefing, no lost decisions.",
    href: "#compare",
    sample: `## Project: users-api
## Status: IN PROGRESS

| ID  | Feature                | Status | Delivery | Refactor |
|-----|------------------------|--------|----------|----------|
| 001 | Paginate the user list | DONE   | PASS     | PASS     |
| 002 | Filter users by role   | PENDING| -        | -        |`,
  },
]

const active = ref(0)
const tabRefs = ref<HTMLButtonElement[]>([])

function select(index: number) {
  active.value = (index + tabs.length) % tabs.length
  tabRefs.value[active.value]?.focus()
}
</script>

<template>
  <div class="highlights">
    <div class="tablist" role="tablist" aria-label="Highlights">
      <button
        v-for="(tab, index) in tabs"
        :id="`tab-${tab.id}`"
        :key="tab.id"
        ref="tabRefs"
        role="tab"
        :aria-selected="active === index"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="active === index ? 0 : -1"
        @click="active = index"
        @keydown.right.prevent="select(index + 1)"
        @keydown.left.prevent="select(index - 1)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="(tab, index) in tabs"
      v-show="active === index"
      :id="`panel-${tab.id}`"
      :key="tab.id"
      class="panel"
      role="tabpanel"
      :aria-labelledby="`tab-${tab.id}`"
    >
      <div class="panel-text">
        <h3>{{ tab.title }}</h3>
        <p>{{ tab.text }}</p>
        <a class="more" :href="tab.href">See how it works</a>
      </div>
      <pre class="sample"><code>{{ tab.sample }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.highlights {
  margin-top: 56px;
  text-align: left;
}
.tablist {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
}
button {
  padding: 10px 22px;
  border: 1.5px solid rgba(15, 39, 66, 0.3);
  border-radius: 999px;
  background: transparent;
  color: var(--graphite);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
button[aria-selected="true"] {
  background: var(--blueprint);
  border-color: var(--blueprint);
  color: #fff;
}
button:focus-visible,
.more:focus-visible {
  outline: 3px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 48px;
  align-items: center;
}
.panel h3 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 800;
  font-stretch: 118%;
  line-height: 1.15;
}
.panel p {
  margin: 16px 0 20px;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4a5361;
}
.more {
  font-weight: 650;
  color: var(--blueprint);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-brand-1);
  text-decoration-thickness: 2px;
  text-underline-offset: 5px;
}
.sample {
  margin: 0;
  padding: 24px;
  overflow-x: auto;
  border: 2px solid var(--blueprint);
  background: #0a1c31;
  color: #dcecf6;
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
  line-height: 1.7;
}
@media (max-width: 860px) {
  .panel {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
}
</style>
