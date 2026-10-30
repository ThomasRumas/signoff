---
title: Shared store (Pinia as example).
globs: ["{**/stores/**/*.{ts,js},**/*.store.{ts,js}}"]
sources:
  - engineering-rules/reactivity-management/README.md
---
- Use a store only for state shared by independent parts of the application; flag stores created only because data comes from an API or a view has many fields.
- Store creation initializes defaults and MUST NOT fetch application data automatically; load when a consumer needs it unless a prefetch is documented.
- When loaded-vs-empty matters, distinguish not-yet-loaded (`null`) from successfully empty (`[]`).
- Default loads avoid duplicate calls for loaded data and coordinate concurrent calls; clear the in-flight promise on settlement and leave failed loads retryable.
- The store owns state, lifecycle, and request coordination; API calls, mapping, and business operations belong in a service.
