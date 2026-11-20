# Rule 004: Response payloads use the single annotation mechanism

**Scope:** path operation return annotations and `response_model=` parameters
in `presentation/http/`.
**Status:** Proposed

## Statement

Choose one payload mechanism and mean it: the return-type annotation carries
the response model, and `response_model=` is not also declared. The mechanism
is `from __future__ import annotations` — do not add it if the response model
is built at runtime (generative generics, forward references that must be
resolved), because that annotation mode makes such models fail to resolve.

**Why:** declaring the same model twice means the framework validates twice,
and documentation reflects the wrong source; a mismatched annotation and
response model means silent validation bugs.

## Apply

**When:** every new or changed path operation function signature.

## Detect

- Flag a route function that has both a return-type annotation AND a
  `response_model=` parameter.
- Flag `response_model=Any`/`None`/bare `dict` to bypass validation when an
  explicit model exists.
- Flag `from __future__ import annotations` added to a module whose response
  models need runtime resolution (generative generics, `Annotated` metadata
  fields).
- Flag a route without either mechanism when it returns anything other than a
  documented streaming `Response`.

### Good

```python
# presentation/http/routes/model_info.py
@router.get("/model-info")
async def model_info(...) -> ModelInfoResponse:     # one source: the annotation
    ...
```

### Bad

```python
# presentation/http/routes/model_info.py (current starter code — fix it)
@router.get("/model-info", response_model=ModelInfoResponse)
async def model_info(...) -> ModelInfoResponse:     # declared twice
    ...
```

## Exceptions

- Streaming endpoints legitimately return `Response` with no model (see
  [streaming](../streaming/001-streaming-responses.md)); the explicit
  `status_code` and declared error codes still apply.
- A documented `dict` payload (a raw SDK data-stream dict) is the accepted
  response type for the streaming route — not a bypass — when the streaming
  adapter produces it.
