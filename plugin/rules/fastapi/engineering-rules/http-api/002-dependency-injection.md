# Rule 002: Route collaborators come from the container

**Scope:** FastAPI dependency wiring — `Depends`, `Annotated`,
`app.state`, `Depends()` in route signatures.
**Status:** Approved

## Statement

Route collaborators and cross-cutting services come from the app's
dependency container (`app.state` + `create_app` wiring, or a provider
library), and route signatures use `Annotated` dependency aliases — never a
constructed concrete class imported into a route module.

**Why:** this starter has no persistence and therefore no repository
container — but `app.state` is the container. When a persistence layer
arrives, follow the framework's own guidance on the repository pattern
(single `Annotated` dependency per route, no global mutable model state,
`Depends()` on shared dependency functions only).

## Apply

**When:** every route that needs a collaborator; every new cross-cutting
service (configuration, catalog, identity).

## Detect

- Flag a route module that directly imports a concrete adapter from
  `infrastructure/` to call inside a handler.
- Flag an inline `Depends(...)` lambda or call expression inside a route
  signature; dependencies are declared as reusable `Annotated` aliases.
- Flag `Depends()` used on a function that already injects dependencies in
  its own signature — framework dependency functions declare sub-dependencies
  as plain parameters, not `Depends()` calls.

### Good

```python
# presentation/http/dependencies.py
ConfigurationDep = Annotated[Configuration, Depends(get_configuration)]
ModelCatalogDep = Annotated[ModelCatalog, Depends(get_model_catalog)]

def get_model_catalog(request: Request) -> ModelCatalog:
    """Framework boundary; reads the port from the app container."""
    return request.app.state.model_catalog
```

```python
# routes use the alias only
async def model_info(configuration: ConfigurationDep, catalog: ModelCatalogDep) -> ...:
```

### Bad

```python
from infrastructure.model_catalog import VercelGatewayModelCatalog

@router.get("/model-info")
async def model_info():
    catalog = VercelGatewayModelCatalog()   # concrete wired into the route
```

## Exceptions

- None required in this starter yet. When a persistence layer is introduced,
  a session container may replace direct `app.state` reads; keep the single
  `Annotated` alias pattern.
