---
title: FastAPI routes and path operation functions.
globs: ["**/routes/**/*.py", "**/api/routers/**/*.py"]
sources:
  - engineering-rules/http-api/README.md
  - architecture/001-backend-layer-structure.md
  - engineering-rules/streaming/README.md
  - engineering-rules/error-handling/README.md
---
- Path operation functions MUST stay thin: validate input, call one use case, map the output or error. Flag inline business policy, configuration resolution, provider or persistence calls, and raw provider/SDK payload returns.
- Route collaborators MUST come from the dependency container (`Annotated` aliases wired in `create_app`/`bootstrap.py`); flag route modules importing infrastructure concretes or constructing adapters inline.
- Routers MUST be created through the version/tag factory (`create_api_router`) and mounted with explicit `prefix=` and `tags=`; flag bare `APIRouter()` construction or route declarations directly on the app object.
- A response payload uses ONE mechanism — return-type annotation OR `response_model=`, never both; flag `dict`/`Any` returns outside documented streaming routes.
- Streaming endpoints go through the SDK adapter's encoder (`EventStreamResponse`) with `status_code=200` and declared error parts; flag hand-built stream chunks.
- Domain failures are raised as domain error types and translated once in this layer; routes declare the matching error model on each failure path.
