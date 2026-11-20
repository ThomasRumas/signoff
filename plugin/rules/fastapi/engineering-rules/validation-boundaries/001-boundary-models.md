# Rule 001: Define one boundary model per payload; map to internal types at the edge

**Scope:** Pydantic models in `presentation/http/schemas.py` and
`presentation/http/streaming/schemas.py`.
**Status:** Approved

## Statement

Request and response payloads use explicit Pydantic model classes — one model
per boundary payload, field types as `Annotated` constraints — and convert to
and from the internal domain dataclasses at the boundary via explicit
mapping functions, never raw framework objects passed through.

**Why:** framework request and response objects leak into the application
layer when no boundary model exists, and validation rules end up split across
the framework and the application. The domain layer stays pure (architecture
rule), so every payload crosses the boundary as a mapped, typed object.

## Apply

**When:** every new request or response payload.

## Detect

- Flag a route accepting or returning a bare `dict`, `Any`, or unvalidated
  JSON in its signature when a model exists elsewhere.
- Flag shared internal domain dataclasses reused as request models or response
  models; boundary models live in `presentation/http/`.
- Flag request models re-parsing their own validated `.data` attribute instead
  of returning the converted model.
- Flag boundary models without an explicit mapping to the internal type
  (`to_domain()` or a `model_validator`).

### Good

```python
# presentation/http/schemas.py
ChatMessageDict = dict[str, str]

IdField = Annotated[str, StringConstraints(pattern=r"^[0-9a-f]{32}$")]
UuidField = Annotated[UUID, Field(default_factory=uuid4)]

class ChatRequest(BaseModel):
    messages: list[ChatMessageDict] = Field(default_factory=list)
    id: IdField
    ...

    def to_domain(self) -> ChatRequestModel:
        return ChatRequestModel(id=self.id, system_prompt=self.system_prompt, ...)
```

### Bad

```python
@router.post("/chat")
async def chat(payload: dict) -> ChatResponse:
    messages = payload["messages"]                 # untyped, re-read later
    if "id" in payload: ...                        # second parsing layer
    return ChatResponse(**payload)                 # domain object leak
```

## Exceptions

- `ChatMessageDict = dict[str, str]` — message payloads follow the SDK's
  own data-stream message schema; the framework already constrains the shape.
- The SDK's raw chunk dicts (`dict[str, Any]`) are accepted in the streaming
  encoder boundary only.
