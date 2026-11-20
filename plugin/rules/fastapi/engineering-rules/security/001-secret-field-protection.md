# Rule 001: Secrets never sit in plain model fields

**Scope:** all models holding secrets — settings models, request models, and
any `repr`-visible credential field.
**Status:** Approved

## Statement

Any secret-bearing model field is protected so it cannot leak through `repr`,
logging, or serialization — by default `Field(..., repr=False)` on the field,
and `SecretStr` (or equivalent) for anything that outlives a single request.

**Why:** request logs and crash dumps are the most common accident; a secret
in a model repr is a secret leaked to every log line and error report.

## Apply

**When:** adding any field that holds an API key, token, or password.

## Detect

- Flag a model field named like a secret (ends in `_key`, `_token`,
  `_secret`, `_password`, or holding a bearer/authorization value) without
  `repr=False` (or `SecretStr`).
- Flag a settings model serialized to a log line or error payload.
- Flag a secret value assigned to a plain attribute on a non-secret object.
- Flag an `auth_token`/`authorization` value logged or embedded in a debug
  message.

### Good

```python
# presentation/http/streaming/schemas.py
auth_token: str | None = Field(default=None, repr=False)
```

### Bad

```python
class VercelGatewaySettings(BaseModel):
    api_key: str                        # appears in repr, logs, tracebacks
```

## Exceptions

- None.
