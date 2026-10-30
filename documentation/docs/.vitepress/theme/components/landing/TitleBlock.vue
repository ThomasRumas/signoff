<script setup lang="ts">
const rows = [
  { role: "Drawn by", who: "Delivery agent", note: "spec.md, code and tests" },
  { role: "Checked by", who: "Refactor agent", note: "every AC, EC and team rule" },
  { role: "Approved by", who: "You", note: "nothing ships without it" },
]
</script>

<template>
  <figure class="title-block" aria-label="Drawing title block: drawn by the Delivery agent, checked by the Refactor agent, approved by you">
    <div class="sheet">
      <div class="head">
        <span>Feature 001</span>
        <span>Paginate the user list</span>
        <span>Rev. A</span>
      </div>
      <div v-for="(row, index) in rows" :key="row.role" class="row" :style="{ '--i': index }">
        <span class="role">{{ row.role }}</span>
        <span class="who">{{ row.who }}</span>
        <span class="note">{{ row.note }}</span>
      </div>
    </div>
    <div class="stamp" aria-hidden="true">
      <span class="stamp-word">APPROVED</span>
      <span class="stamp-by">by you</span>
    </div>
  </figure>
</template>

<style scoped>
.title-block {
  position: relative;
  width: min(640px, 100%);
  margin: 0 auto;
}
.sheet {
  border: 2px solid var(--line-cyan);
  color: #dcecf6;
  text-align: left;
}
.head,
.row {
  display: grid;
  grid-template-columns: 9.5rem 1fr;
  border-bottom: 1px solid rgba(124, 196, 232, 0.45);
}
.head {
  grid-template-columns: 6.5rem 1fr 4rem;
  font-size: 0.85rem;
  color: var(--line-cyan);
}
.head span,
.row span {
  padding: 10px 14px;
}
.head span + span,
.row .who {
  border-left: 1px solid rgba(124, 196, 232, 0.45);
}
.row:last-child {
  border-bottom: none;
}
.role {
  color: var(--line-cyan);
  font-size: 0.85rem;
  align-self: center;
}
.who {
  font-size: 1.15rem;
  font-weight: 650;
  font-stretch: 112%;
  color: #fff;
}
.note {
  grid-column: 2;
  padding-top: 0 !important;
  border-left: 1px solid rgba(124, 196, 232, 0.45);
  font-size: 0.85rem;
  color: #a9c3d6;
}
.row {
  opacity: 0;
  animation: draw 0.5s ease-out forwards;
  animation-delay: calc(0.5s + var(--i) * 0.45s);
}
.stamp {
  position: absolute;
  right: -10px;
  bottom: -34px;
  display: grid;
  place-items: center;
  width: 150px;
  height: 150px;
  border: 5px double var(--approval-red);
  border-radius: 50%;
  color: var(--approval-red);
  transform: rotate(-14deg);
  opacity: 0;
  animation: stamp 0.35s cubic-bezier(0.2, 1.6, 0.4, 1) 2.1s forwards;
  mix-blend-mode: screen;
}
.stamp-word {
  font-size: 1.45rem;
  font-weight: 900;
  font-stretch: 125%;
  letter-spacing: 0.04em;
  margin-top: 30px;
}
.stamp-by {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 34px;
}
@keyframes draw {
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}
@keyframes stamp {
  from {
    opacity: 0;
    transform: rotate(-14deg) scale(1.9);
  }
  to {
    opacity: 1;
    transform: rotate(-14deg) scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .row,
  .stamp {
    animation: none;
    opacity: 1;
  }
}
@media (max-width: 560px) {
  .head,
  .row {
    grid-template-columns: 6.5rem 1fr;
  }
  .head span:last-child {
    display: none;
  }
  .stamp {
    width: 116px;
    height: 116px;
    right: 4px;
    bottom: -48px;
  }
  .stamp-word {
    font-size: 1.1rem;
    margin-top: 22px;
  }
  .stamp-by {
    font-size: 0.8rem;
    margin-bottom: 24px;
  }
}
</style>
