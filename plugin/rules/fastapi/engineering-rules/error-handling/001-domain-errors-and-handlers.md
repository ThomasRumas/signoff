# Rule 001: Raise domain errors, translate once at the boundary

**Scope:** exception classes in `domain/`, use cases in `application/`, and
`RequestValidationError` handlers in `presentation/http/`.
**Status:** Approved

## Statement

Use cases and ports raise domain error types (or typed errors returned as
data, as the `ModelCatalog` port does) — never HTTP status codes, JSON, or
framework exception classes. The presentation layer translates once: exception
handlers map framework validation errors to structured payloads, and routes
translate domain failures to the declared error model.

**Why:** a translation buried in a route or handler cannot be tested without
driving the web layer; a generic 500 for a domain failure erases the
difference between "not found", "unsupported", and "provider down".

## Apply

**When:** every new failure path, and every change to error response models.

## Detect

- Flag an application-layer module raising `HTTPException` or returning
  status codes.
- Flag `except Exception` swallowing an error and continuing without logging
  (bare handlers).
- Flag routes raising `HTTPException` for domain-level conditions where a
  handler exists (translation happens twice on the same path).
- Flag a missing handler for a domain error type that has a declared HTTP
  error model.
- Flag a route's `responses=` without the declared model for its failure path.

### Good

```python
# application/model_info.py
async def execute(self) -> ModelInfoResult:
    try:
        return await self._catalog.get(self._model_id)
    except ModelCatalogError as exc:
        logger.warning("model_info.catalog_unavailable model_id=%s", self._model_id)
        raise UnsupportedModelVersion(exc.model_id) from exc
```

```python
# presentation/http/app.py
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(status_code=422, content=_validation_error_payload(exc))
```

### Bad

```python
# application/chat.py
async def execute(self):
    try:
        agents = await load_agent_definitions(...)
    except Exception:
        raise HTTPException(status_code=500)   # framework error in use case
```

## Exceptions

- `HTTPException` may be used as an intentional early-return for a documented
  non-failure branch (e.g. the `chat` fallback) when the route declares the
  matching `responses=` model.
