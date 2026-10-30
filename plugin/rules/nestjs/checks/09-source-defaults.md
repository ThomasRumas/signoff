---
title: API source defaults.
globs: ["**/*.ts"]
sources:
  - README.md
---
- Design around consumer use cases, not persistence tables. Keep transport handlers focused on input/output translation and business orchestration in application services.
- Public contracts stay independent of persistence models.
- Documented errors have a stable machine-readable code and a safe message; unknown failures stay generic.
- When the project uses RxJS, keep asynchronous flows Observable-based without unnecessary Promise conversion.
- Do not log secrets. Do not swallow errors.
