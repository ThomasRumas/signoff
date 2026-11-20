# Decision: Backend Layer Structure

## Status

Accepted

## Scope

The Python backend package: every module under `src/` and its tests.

## Context

A FastAPI starter tends to grow route functions that load configuration, query
providers, and build SDK objects inline. That makes business rules impossible
to test without FastAPI, HTTPX, and the agent SDK, and couples every change to
the framework. The backend here is one deployable modular monolith, so it does
not need packages-per-service ceremony — it needs visible boundaries.

## Decision

Use a pragmatic layered architecture with ports only at real external
boundaries. Four layers plus one composition root:

```text
presentation  -> application -> domain
infrastructure -> application -> domain
bootstrap      -> all layers
domain         -> Python standard library only
```

`bootstrap.py` is the only module that knows concrete implementations. A
`typing.Protocol` port is introduced only when there is a real side effect,
more than one useful implementation, or a useful test seam — never to satisfy
a diagram.

## Rules

- An import MUST follow the dependency rule above. Flag any import that breaks
  it.
- `src/domain/` MUST NOT import FastAPI, Starlette, HTTPX, Pydantic, or the
  agent SDK; it may import only the standard library and sibling domain
  modules.
- `src/application/` MUST NOT import framework or transport libraries; it may
  import the standard library, domain modules, and its own ports.
- Path operation functions MUST NOT contain business policy, configuration
  resolution, provider queries, or fallback decisions; the shape is validate
  input -> call one use case -> map output or error.
- Concrete implementations MUST be assembled in `bootstrap.py` and reach other
  layers only as ports or dependencies; flag a route or module that imports an
  infrastructure concrete class (a repository, an HTTPX catalog, a config
  loader) directly.
- Packages MUST be created only as code moves into them; empty scaffolding is
  prohibited.

## Rationale

Dependencies point toward policy, so business rules become visible and
directly testable without network calls or model execution. The dependency
direction is simple enough to enforce in code review without an import-linter
tool. A protocol at a fake-only boundary adds ceremony with no second
implementation to swap.

## Alternatives Considered

- **Strict hexagonal architecture (ports and adapters everywhere)**: rejected —
  interfaces for every internal function add indirection with no variation.
- **Feature-based vertical slices (`users/`, `orders/` style folders)**:
  rejected — there is no business domain set yet; the monolith stays one
  package until modules have more than one reason to change.
- **Service-per-concept packages**: rejected — premature distribution for a
  single deployable.

## Consequences

- Boundary mapping (untrusted payload -> boundary model -> internal dataclass)
  adds a small amount of code on purpose.
- During migration, old and new structures may temporarily coexist; delete
  superseded modules without keeping compatibility wrappers.
- The agent SDK streaming protocol has one explicit adapter-to-adapter seam in
  presentation; that seam is not permission to expose the SDK to application
  or domain code.

## Exceptions

- Tight third-party protocol glue (Vercel AI SDK <-> agent SDK) may coordinate
  presentation and infrastructure adapters in the streaming package. Framework
  objects still must not pass through application or domain APIs.

## Examples

### Good

```text
src/
├── bootstrap.py          # composition root, the only concrete-aware module
├── domain/               # frozen dataclasses, enums, plain functions
├── application/          # use cases + ports (GetModelInfo, PrepareChat)
├── infrastructure/       # TOML loading, HTTPX catalog, SDK agent builders
└── presentation/http/    # app factory, routers, schemas, streaming adapter
```

```python
# presentation/http/routes/model_info.py — thin route, one use case
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

`catalog` is the `ModelCatalog` port from `application/`; the concrete HTTPX
adapter is wired only in `bootstrap.py`.

### Bad

```python
@router.get("/model-info")
async def model_info() -> dict:
    config = load_configuration()                     # infrastructure import
    async with httpx.AsyncClient() as client:         # provider query inline
        payload = (await client.get(...)).json()
    if "data" not in payload:                         # fallback policy inline
        return {"name": config.defaults.model}
    return payload                                    # raw provider JSON
```

The route now depends on configuration, transport, and fallback policy; no test
can exercise the fallback rule without a live provider call.
