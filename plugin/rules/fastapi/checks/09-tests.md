---
title: Backend tests (contract tests, seams, hypothesis, gates).
globs: ["**/tests/**/*.py"]
sources:
  - engineering-rules/testing-strategy/README.md
  - architecture/001-backend-layer-structure.md
---
- Tests drive production entry points: `TestClient` around `create_app` with injected fakes; flag hand-built routers, framework internals asserted directly (route registries, OpenAPI), and live network/model calls.
- Mock at the seam the code already owns (monkeypatch adapter methods like `DelegationVercelAIAdapter.dispatch_request` with `AsyncMock`); flag patching internals behind seams.
- Hypothesis is required for behaviours touching untrusted input (id patterns, chat parsing, streaming chunk mapping, boundary mapping); one hard-coded case is not a substitute.
- Assert resulting behaviour and response shape, not mock call bookkeeping.
- Gates: `uv run ty check .`, `uv run ruff check .`, `uv run pytest` — same commands as CI, run from the repo root.
- Keep tests at `backend/tests/contract/...` mirroring behaviour names; flag `skip = True` without a reason comment.
