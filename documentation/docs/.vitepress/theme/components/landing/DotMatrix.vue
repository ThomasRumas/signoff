<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const props = defineProps<{ filled: number }>()
const root = ref<HTMLElement>()
const shown = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    shown.value = true
    return
  }
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    shown.value = true
    observer?.disconnect()
  }, { threshold: 0.4 })
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="dots" :class="{ shown }" role="img" :aria-label="`${props.filled} out of 100`">
    <span v-for="n in 100" :key="n" :class="{ on: n <= props.filled }" :style="{ '--n': n }" />
  </div>
</template>

<style scoped>
.dots {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: clamp(6px, 1.2vw, 12px);
  width: min(360px, 100%);
}
span {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.35;
}
span.on {
  transition: background-color 0.2s, opacity 0.2s;
  transition-delay: calc(var(--n) * 18ms);
}
.shown span.on {
  background: currentColor;
  opacity: 1;
}
</style>
