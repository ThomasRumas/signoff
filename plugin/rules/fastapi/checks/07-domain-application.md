---
title: Domain and application layers (use cases, ports, domain rules).
globs: ["{**/domain/**/*.py,**/application/**/*.py}"]
sources:
  - architecture/001-backend-layer-structure.md
  - engineering-rules/error-handling/README.md
---
- Neither layer MAY import FastAPI, Starlette, HTTPX, Pydantic, or the agent SDK; domain imports only the standard library and sibling domain modules; application imports its own ports too.
- Use cases express validate -> one orchestration -> map result; flag provider queries, fallback decisions, and configuration resolution inline.
- Failures raise domain error types (or typed errors returned as data by ports); flag `HTTPException` and status-code construction.
- No framework or SDK objects in signatures or return values of this layer; boundary mapping happens in presentation.
- Every new use case gets at least one contract/unit test driving it with fakes/monkeypatches, no network.
