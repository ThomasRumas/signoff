---
title: NestJS module.
globs: ["**/*.module.ts"]
sources:
  - architecture/001-api-application-structure-and-dependency-direction.md
  - architecture/003-api-runtime-and-process-boundaries.md
---
- The root module composes shared and feature modules; it MUST NOT contain business workflows.
- A feature module owns one business capability; it MUST NOT own startup, listener, or infrastructure concerns.
- Flag imports of another feature's private providers instead of its exported module API, and circular module dependencies.
