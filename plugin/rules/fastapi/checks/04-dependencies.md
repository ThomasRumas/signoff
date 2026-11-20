---
title: Dependency wiring (`Annotated` aliases and container reads).
globs: ["**/dependencies.py"]
sources:
  - engineering-rules/http-api/README.md
  - engineering-rules/configuration-lifecycle/README.md
---
- Dependencies are `Annotated` aliases over named reusable functions; flag lambdas or inline `Depends(...)` call expressions in route signatures.
- Framework boundary functions read ports from `request.app.state`; flag direct infrastructure concrete construction or scattered settings resolution inside dependency functions.
- A dependency that injects another takes plain parameters, not `Depends()` on its own sub-dependencies.
- No per-call settings resolution: configuration is resolved once and injected.
