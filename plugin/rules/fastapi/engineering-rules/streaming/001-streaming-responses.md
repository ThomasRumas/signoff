# Rule 001: Use the framework's streaming encoding; never hand-encode the protocol

**Scope:** `presentation/http/routes/chat.py` and `presentation/http/streaming/`.
**Status:** Approved

## Statement

Streaming responses must use the framework's async streaming with
`StreamingResponse`, and must be protocol-correct through the installed
adapter for the SDK's data stream format — never hand-formatted chunks. The
route owns only the HTTP surface: `status_code=200`, the declared streaming
error model, `EventStreamResponse`, and the declared error codes.

**Why:** the wire protocol (event framing, `[DONE]` marker, error part
shape) is defined by the SDK's data stream specification; hand-built chunks
drift from it and break the client silently. The installed adapter keeps the
route free of protocol details.

## Apply

**When:** adding or changing a streaming endpoint.

## Detect

- Flag any `yield`/`return` of string-formatted stream chunks in a route or
  adapter that bypass the SDK adapter's encoder.
- Flag a streaming endpoint without explicit `status_code=200` and a declared
  streaming error model.
- Flag a raw `StreamingResponse(media_type=...)` hand-built in a route rather
  than through the adapter's `EventStreamResponse`.
- Flag chunks built by concatenating dict literals instead of adapter output.

### Good

```python
# presentation/http/routes/chat.py
@router.post(
    "",
    status_code=200,
    response_model=ChatExecutionErrorResponse,
    openapi_extra={
        "responses": {
            "200": {"content": {"text/plain": {"schema": {"type": "string"}}}},
            "400": {"model": ChatRequestErrorResponse},
            "404": {"model": ChatNotFoundErrorResponse},
        }
    },
)
async def chat(request: ChatRequest, prepare: ChatPreparerDep) -> Response:
    prep = await prepare.prepare(...)
    return EventStreamResponse(
        prepare.agent_client.run_agent(
            chat_prompt, model_settings=model_settings
        ),
        status_code=200,
        stream_error_part=chat_execution_error_part(prep.error_status, prep.error_message),
    )
```

```python
# presentation/http/streaming/vercel.py — protocol seam only
class DelegationVercelAIAdapter:
    def __init__(self, agent_client: AbstractAgent) -> None:
        self._agent_client = agent_client

    async def dispatch_request(self, request: ChatRequest, chat_prompt: str):
        return await self._agent_client._get_chat_response(...)
```

### Bad

```python
@router.post("/chat")
async def chat(request: ChatRequest):
    async def gen():
        yield f"data: {json.dumps({'text': reply})}\n\n"   # hand-built chunks
        yield "data: [DONE]\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
```

## Exceptions

- The streaming route legitimately returns a bare `Response`/`StreamingResponse`
  with no response model — the framework cannot validate a stream.
- `DelegationVercelAIAdapter` (presentation) calling the SDK adapter's own
  encode seam is the documented framework glue exception in the architecture;
  it stays a thin protocol bridge, not reusable application logic.
