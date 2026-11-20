# Rule 001: Contract tests drive `create_app`; properties pin framework-facing behaviour

**Scope:** all tests under `backend/tests/`.
**Status:** Approved

## Statement

Tests go through the same entry points production code uses: `TestClient`
around `create_app(...)` with injected fakes for contract and integration
tests, direct calls for use cases and pure domain functions. Network, the
model gateway, and agent execution stay outside tests — seams, never live
calls. Property tests (rule 002) cover anything that parses, encodes, or maps
untrusted input.

**Why:** the starter's whole value is that the ASGI app is real in tests;
unit-testing a route instead of driving it tests a copy of the wiring.

## Apply

**When:** every new test, and every route/use case change without coverage.

## Detect

- Flag a test that builds an `APIRouter` by hand and drives only that —
  mount it through `create_app` instead.
- Flag a test making real network calls (no `httpx.MockTransport`, no
  monkeypatched adapter, no injected fake).
- Flag a test asserting on framework internals (decorator registries,
  OpenAPI JSON) rather than behaviour.
- Flag a test directory tree mirroring `src/` one-to-one with no test per
  behaviour; keep one test per behaviour.

### Good

```python
# tests/contract/presentation/http/test_app.py
def _app() -> FastAPI:
    return create_app(
        configuration=Configuration(agents={}), model_catalog=_StaticCatalog()
    )

def test_cors_options_preflight_response() -> None:
    with TestClient(_app()) as client:
        response = client.options(
            "/agents", headers={"Origin": "http://localhost:5173"}
        )
    assert response.status_code == 204
```

```python
# tests/contract/presentation/http/test_chat.py — seam mocked, not framework
def test_chat_streams_vercel_data_stream(monkeypatch) -> None:
    monkeypatch.setattr(
        DelegationVercelAIAdapter,
        "dispatch_request",
        AsyncMock(return_value=_sse_body(...)),
    )
```

### Bad

```python
def test_get_model_info_reads_environment(monkeypatch) -> None:
    monkeypatch.setenv("DEFAULT_MODEL", "x")        # per-call env read
    ...
def test_router_registry_contains_agents() -> None: # framework internals
    assert "agents" in app.routes
```

## Exceptions

- None.
