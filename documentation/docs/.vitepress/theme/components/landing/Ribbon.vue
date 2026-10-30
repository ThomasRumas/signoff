<script setup lang="ts">
const links = [
  { href: "#overview", label: "Overview" },
  { href: "#the-shift", label: "The shift" },
  { href: "#control", label: "Control" },
  { href: "#rules", label: "Rules" },
  { href: "#compare", label: "Compare" },
]
</script>

<template>
  <nav class="ribbon" aria-label="Page sections">
    <div class="inner">
      <a class="name" href="#top">Signoff</a>
      <ul>
        <li v-for="link in links" :key="link.href"><a :href="link.href">{{ link.label }}</a></li>
      </ul>
      <a class="install" href="#quick-start">Install</a>
    </div>
  </nav>
</template>

<style scoped>
.ribbon {
  position: sticky;
  top: var(--vp-nav-height);
  z-index: 10;
  background: rgba(15, 39, 66, 0.86);
  backdrop-filter: saturate(160%) blur(16px);
  border-bottom: 1px solid rgba(124, 196, 232, 0.25);
}
.inner {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1080px;
  height: 52px;
  margin: 0 auto;
  padding: 0 24px;
}
.name {
  font-weight: 800;
  font-stretch: 115%;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}
ul {
  display: flex;
  gap: 22px;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}
ul a {
  font-size: 0.88rem;
  color: #c4d6e4;
  text-decoration: none;
}
ul a:hover {
  color: #fff;
}
.install {
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--paper);
  color: var(--blueprint);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
}
a:focus-visible {
  outline: 2px solid var(--line-cyan);
  outline-offset: 3px;
}
@media (max-width: 760px) {
  ul {
    display: none;
  }
  .install {
    margin-left: auto;
  }
}
</style>
