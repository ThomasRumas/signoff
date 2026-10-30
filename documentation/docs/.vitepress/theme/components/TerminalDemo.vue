<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

type Line = { kind: "prompt" | "agent" | "gate" | "pass" | "commit"; text: string }

const script: Line[] = [
  { kind: "prompt", text: "> Add pagination to GET /users" },
  { kind: "agent", text: "orchestrator  Proposed feature 001: paginate the user list" },
  { kind: "gate", text: "✓ Feature approved" },
  { kind: "agent", text: "delivery      spec.md → AC-1, AC-2, EC-1 · rules: nestjs/03-controller" },
  { kind: "gate", text: "✓ Spec approved" },
  { kind: "agent", text: "delivery      Implemented + 3 tests" },
  { kind: "pass", text: "refactor      AC-1 ✓  AC-2 ✓  EC-1 ✓  → PASS" },
  { kind: "commit", text: "Suggested commit: feat(users): paginate user list" },
]

const shown = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    shown.value = script.length
    return
  }
  timer = setInterval(() => {
    shown.value = shown.value >= script.length + 3 ? 0 : shown.value + 1
  }, 900)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="terminal" aria-label="Example session">
    <div class="bar"><span /><span /><span /></div>
    <ol>
      <li v-for="(line, index) in script" :key="index" :class="[line.kind, { visible: index < shown }]">
        {{ line.text }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
.terminal {
  width: 100%;
  max-width: 520px;
  border-radius: 12px;
  background: #0a1c31;
  border: 1px solid rgba(124, 196, 232, 0.45);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  overflow: hidden;
  text-align: left;
}
.bar {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  background: #10294a;
}
.bar span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b5878;
}
ol {
  list-style: none;
  margin: 0;
  padding: 16px;
  min-height: 250px;
}
li {
  margin: 0 0 8px;
  color: #cbdcea;
  white-space: pre-wrap;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.3s, transform 0.3s;
}
li.visible {
  opacity: 1;
  transform: none;
}
.prompt {
  color: #f8fafc;
  font-weight: 600;
}
.gate {
  color: #ff6b7d;
}
.pass {
  color: #7cc4e8;
}
.commit {
  color: #fff;
}
</style>
