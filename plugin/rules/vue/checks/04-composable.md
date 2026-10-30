---
title: Composable (reusable reactive behavior).
globs: ["**/composables/**/*.{ts,js}"]
sources:
  - engineering-rules/composable-management/README.md
---
- Create one only for reusable reactive or lifecycle-bound behavior; flag extraction of a few trivial lines or a renamed stateless helper.
- Keep state inside the function; module-level reactive state is an implicit global store.
- Read changing inputs in a tracked reactive context and handle in-flight and stale async results.
- Clean up timers, listeners, subscriptions, observers, and polling when the owner's lifecycle ends; start no effects at module import.
- Business rules, API calls, API/model mapping, and substantial framework-independent transformations belong in a service, not a composable.
- Use a focused name following the framework convention (`useXxx` in Vue); flag generic names such as `useUtils`, `useData`, or `useEverything`.
