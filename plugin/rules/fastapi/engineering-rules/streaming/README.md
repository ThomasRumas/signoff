# Engineering rules — Theme: Streaming

> **Scope:** streaming HTTP responses in `presentation/http/routes/` and `presentation/http/streaming/`.

## Theme rules

### Encoding the response

| # | Rule | Status |
|---|------|--------|
| 001 | [Use the framework's streaming encoding; never hand-encode the protocol](001-streaming-responses.md) | Approved |

## Out of scope for this theme

- What the streamed events mean (UI re-rendering rules): client concern.
- Agent execution and model choice: application layer concern.
