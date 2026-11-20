# Rule 001: Log structured records with request context

**Scope:** all `src/` modules; `src/observability/` for the provider.
**Status:** Proposed — the repo has no trace provider yet; `logging` is the
existing mechanism. When OpenTelemetry is adopted, adopt the provider
contract below; until then the message-content parts are live rules.

## Statement

`logging.getLogger(__name__)` is the logger source. Log messages keep a stable
`key=value` message shape so log lines remain greppable (e.g.
`"model_info.catalog_unavailable model_id=%s"`), and failures log the
identifying context, not a raw traceback string. When a trace provider is
adopted, it lives in `src/observability/`, is configured during the app
startup phase, and is registered via `BaseHTTPMiddleware` that extracts or
generates a trace ID and stores it on the framework request state so logs and
responses carry correlation.

**Why:** when a request fails in a distributed system, log and trace
correlation is the debugging path; scattered loggers and bare tracebacks
break it.

## Apply

**When:** every module that logs, and when adopting OpenTelemetry.

## Detect

- Flag `print(...)` inside `src/` (the root `bootstrap.py` startup line is
  the sole allowed exception).
- Flag a module-level logger created via `logging.basicConfig` elsewhere than
  `bootstrap.py`.
- Flag log lines that interpolate raw exception text without a stable prefix.
- When a provider is adopted: flag a provider configured in any module other
  than `observability/`; flag a middleware that does not set the request-state
  attribute used for correlation.

### Good

```python
# application/model_info.py
logger = logging.getLogger(__name__)
...
except ModelCatalogError as exc:
    logger.warning("model_info.catalog_unavailable model_id=%s", self._model_id)
    raise UnsupportedModelVersion(exc.model_id) from exc
```

### Bad

```python
# a route handler
print(f"error {e}")                     # uncorrelated, unstructured
```

## Exceptions

- `bootstrap.py` keeps a plain startup log line (it runs before the logging
  provider is configured — and the framework warns against doing anything in
  module-level top-to-bottom bootstrap code).
