<script setup lang="ts">
import { data as stacks } from "../rules.data"

const label: Record<string, string> = { nestjs: "NestJS", vue: "Vue" }
const documents = stacks.reduce((total, stack) => total + stack.documents, 0)
</script>

<template>
  <div class="rule-stats">
    <div v-for="stack in stacks" :key="stack.id" class="stat">
      <strong>{{ stack.checks }}</strong>
      <span>{{ label[stack.id] ?? stack.id }} checks</span>
    </div>
    <div class="stat">
      <strong>{{ documents }}</strong>
      <span>rules &amp; decisions</span>
    </div>
  </div>
</template>

<style scoped>
.rule-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 24px 0;
}
.stat {
  flex: 1 1 160px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-align: center;
}
.stat strong {
  display: block;
  font-size: 2.25rem;
  line-height: 1.2;
  color: var(--vp-c-brand-1);
}
.stat span {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
</style>
