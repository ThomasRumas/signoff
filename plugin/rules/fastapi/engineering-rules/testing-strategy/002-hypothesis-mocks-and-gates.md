# Rule 002: Hypothesis, mocks, and the quality gates

**Scope:** all tests under `backend/tests/`.
**Status:** Approved

## Statement

- Hypothesis is mandatory for behaviours that touch untrusted input:
  validation parsing, id pattern rejection, streaming chunk encoding, and
  domain mapping. Example properties already in the repo: invalid ids are
  rejected, valid ids are accepted and round-tripped, chat request defaults
  are stable.
- Mocks use the framework's own seams: monkeypatch the adapter method
  (`DelegationVercelAIAdapter.dispatch_request` with `AsyncMock`), never the
  transport underneath the SDK's encoder.
- The test suite runs the same gates as CI: `uv run ty check .`,
  `uv run ruff check .`, `uv run pytest` — from the repo root, in order.
- Coverage of error paths comes from the declared error model and error
  codes, so it stays visible without separate test fixtures.

## Apply

**When:** adding a test file; changing validation, streaming, or error models.

## Detect

- Flag a parsing/encoding helper (id validation, chunk mapping, boundary
  mapping) tested with one hard-coded case and no property.
- Flag `unittest.mock.patch` targets that are private module paths the test
  does not need — prefer monkeypatch with the smallest seam.
- Flag tests that assert only mock call counts, not resulting behaviour.
- Flag a test file that skips the gates (`skip = True` with no reason comment).

### Good

```python
@given(invalid_chat_message_id_values())
@example("")
@example(" ")
@example("0" * 31)
@example("0" * 33)
@example("0" * 32 + "/")
@example("../etc/passwd")
@example("\u205f")
@example("\x00")
@example("x" * 256)
@example("00000000-0000-0000-0000-000000000000")
@example("0" * 1024)
@example("0" * 8 + " " + "0" * 24)
@seed(20261029)
def test_chat_request_rejects_invalid_ids(invalid_id: str) -> None:
    with pytest.raises(ValidationError):
        ChatRequest.model_validate({"messages": [], "id": invalid_id})
```

### Bad

```python
def test_chat_request_bad_id() -> None:      # one case, misses the rest
    with pytest.raises(ValidationError):
        ChatRequest.model_validate({"messages": [], "id": "zz"})
```

## Exceptions

- Hypothesis is not required for thin wiring tests (a route returning one
  use-case result) — the contract example above already applies.
