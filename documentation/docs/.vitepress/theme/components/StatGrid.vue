<script setup lang="ts">
defineProps<{ items: { value: string; label: string }[] }>()
</script>

<template>
  <div class="stat-grid">
    <div v-for="item in items" :key="item.label" class="stat">
      <strong>{{ item.value }}</strong>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.stat {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.stat strong {
  display: block;
  font-size: 2.25rem;
  line-height: 1.2;
  color: var(--vp-c-brand-1);
}
.stat span {
  display: block;
  margin-top: 6px;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
  line-height: 1.45;
}
</style>
