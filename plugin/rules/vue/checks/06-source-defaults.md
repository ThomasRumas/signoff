---
title: Frontend source defaults.
globs: ["**/*.{ts,js}"]
sources:
  - README.md
---
- Keep rendering, interaction, and browser-owned state in the frontend; shared business rules and persistent data stay with their owning API.
- Create components, shared state, composables, or services only around meaningful responsibilities with clear ownership.
- Keep state with its narrowest owner.
- Browser code MUST NOT contain server credentials or private infrastructure details.
