---
title: Streaming adapter (SDK data-stream protocol seam).
globs: ["**/streaming/**/*.py"]
sources:
  - engineering-rules/streaming/README.md
  - engineering-rules/security/README.md
  - architecture/001-backend-layer-structure.md
---
- SDK data-stream framing goes through the installed adapter's encoder; hand-formatted chunks, concatenated dict literals, or manual `[DONE]` markers are prohibited.
- The adapter stays a thin protocol seam: no reusable application logic, and framework/SDK objects never cross into application or domain APIs.
- `EventStreamResponse` and the declared error part own the HTTP surface; flag `StreamingResponse(media_type=...)` built in a route.
- Secret-bearing model fields stay `repr=False` or `SecretStr`; flag credential-named fields without protection.
