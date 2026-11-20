---
title: HTTP boundary models (request and response schemas).
globs: ["**/schemas.py", "**/schemas/**/*.py"]
sources:
  - engineering-rules/validation-boundaries/README.md
  - engineering-rules/security/README.md
---
- One boundary model per payload with explicit `Annotated` constraint types; flag bare `dict`, `Any`, or unvalidated JSON in signatures when a model exists.
- Boundary models MUST NOT double as domain/application models; map explicitly (`to_domain()` or a `model_validator`) to internal types.
- A request model returns its converted model instead of re-reading its own validated attributes; flag second parsing layers.
- Secret-bearing fields are `repr=False` or `SecretStr`; secrets never appear in logs or error payloads.
- Raw SDK chunk dict types stay in the streaming package only.
