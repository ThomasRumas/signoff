# Rule 001: Path operation functions stay thin

**Scope:** FastAPI path operation functions in `presentation/http/routes/`.
**Status:** Approved

## Statement

An HTTP path operation function does exactly three things: validate input,
call one use case, map the output or error. Anything else — business policy,
configuration resolution, provider queries, direct persistence — lives behind
that use case call.

**Why:** the framework boundary must be testable by driving the real ASGI app
without knowing internals; routes that own policy cannot be tested that way.
The framework keeps its own validation layer, so the app's own rules must be
visible separately.

## Apply

**When:** every new or changed path operation function.

## Detect

- The function has fewer than ~10 statements and its body reads: validate ->
  call one use case -> map result or error.
- Flag when a route function: opens a database or HTTP client, resolves config
  or environment values, contains branching business rules, or imports from
  `infrastructure/` directly.
- Flag when a route function returns a raw provider/SDK payload instead of
  mapping to a response model or declared error code.
- Flag when a route function accepts more than one or two collaborators.

### Good

```python
# presentation/http/routes/model_info.py
@router.get("/model-info")
async def model_info(
    configuration: ConfigurationDep, catalog: ModelCatalogDep
) -> ModelInfoResponse:
    result = await GetModelInfo(
        resolve_settings=ConfigurationResolver(configuration).resolve,
        catalog=catalog,
    ).execute()
    return ModelInfoResponse(name=result.name, context_size=result.context_size)
```

One use case, collaborators injected, output mapped to the response model.

### Bad

```python
@router.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    settings = Settings.model_validate(os.environ)      # config resolution
    result = await agent.run_sync(request.prompt)       # provider call
    if result is None:                                  # fallback policy
        result = DEFAULT_REPLY
    return JSONResponse(result)                         # raw payload out
```

The route now owns configuration, provider choice, and fallback policy; none
of it is testable without network calls.

## Exceptions

- Framework-mandated structure (the path operation decorator and signature
  forms) — keep it as the framework requires.
- A path operation may return `Response` or `StreamingResponse` directly when
  the framework requires it (streaming responses set response headers); that
  is not a violation.
