# Rule 003: Routers mount through the version and tag surface

**Scope:** router creation in `presentation/http/routes/` and mounting in
`presentation/http/app.py`.
**Status:** Approved

## Statement

Every route module creates its router via `create_api_router` — the single
factory that applies the version and tag metadata — and `create_app` mounts
routers through `app.include_router` with a prefix and tags. No `APIRouter`
construction at module import time, and no direct `.get()`/`.post()` on `app`.

**Why:** API documentation is the FastAPI app's public contract surface; a
router that skips the factory or mounts with defaults loses it. A router
built at module import time cannot carry per-app settings in tests.

## Apply

**When:** every new route module, and every change to `create_app`.

## Detect

- Flag a bare `APIRouter(...)` construction in a route module; all routers
  come from `create_api_router(...)`.
- Flag `app.include_router(x)` without explicit `prefix=` and `tags=`.
- Flag route declarations directly on the `FastAPI` app object.
- Flag an endpoint path starting with the mount prefix (the prefix duplicates
  it in the mounted URL).

### Good

```python
# presentation/http/routes/agents.py
router = create_api_router(prefix="/agents", tags=["agents"], auth_required=False)

@router.get("")
async def list_agents(...) -> ...: ...
```

```python
# presentation/http/app.py — create_app wires the version surface
app.include_router(agents_router)      # carries its own prefix and tags
app.include_router(chat_router)
```

### Bad

```python
# agents.py
router = APIRouter()

@router.get("/api/v1/agents")          # path holds the mount prefix
async def list_agents(...): ...
```

```python
# app.py
app.get("/agents")(list_agents)        # bypasses the version and tag surface
```

## Exceptions

- None required.
