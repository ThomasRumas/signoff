# Rule 001: Read settings in one pass; own startup and cleanup

**Scope:** `src/` modules that read configuration, and FastAPI
lifespan/startup/shutdown events or handlers.
**Status:** Approved

## Statement

Settings come from one explicit source read at one moment: environment
variables for framework settings (CORS, OTEL), a settings model loaded in a
single pass (TOML file + process environment overrides) for app settings,
resolved once and injected through the dependency container. FastAPI
lifespan — with explicit startup/shutdown handler registration — owns
connect/close of long-lived resources (HTTP clients, telemetry exporters,
agent runtimes).

**Why:** scattered environment reads across the codebase make settings
injection and test overrides impossible; implicit global state creates
unpredictable side effects at import time.

## Apply

**When:** adding configuration keys, long-lived clients, or startup actions.

## Detect

- Flag an `os.environ`/`os.getenv` call anywhere except `bootstrap.py` and
  `presentation/http/app.py` (flag those two as existing exceptions if a new
  module adds them).
- Flag `@app.on_event("startup")`/`("shutdown")` when a lifespan context
  manager is available for the app.
- Flag a connection or client opened at module import time, or opened inline
  in a route function.
- Flag long-lived resources that are never closed.
- Flag a dependency that resolves settings inside its function on every call.

### Good

```python
# presentation/http/app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# CORS_ORIGINS read from environment at app creation, default to local origins
```

```python
# bootstrap.py — resolves once, wires into app.state; dependencies read it there
model_catalog = VercelGatewayModelCatalog()
app = create_app(configuration=configuration, model_catalog=model_catalog)
```

```python
# infrastructure/config/loader.py — single read pass
class ConfigurationLoader:
    def __init__(self, path: Path) -> None:
        self._path = path
    def load(self) -> Configuration:
        if self._path.exists():
        ...
```

### Bad

```python
# somewhere inside a route or use case, per call
model = os.getenv("DEFAULT_MODEL")            # scattered settings read
client = httpx.AsyncClient()                   # inline client, never closed
```

## Exceptions

- `presentation/http/app.py` reads `CORS_ORIGINS` at app creation — this is
  the framework's settings entry, and OTEL is a no-op unless configured.
