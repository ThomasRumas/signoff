---
name: docs-sequence
description: 'Document a scenario as a sequence diagram: participants, ordered calls, responses, errors and alternative paths, in Markdown with Mermaid, or Archify for complex multi-service flows. Use when: documenting a request flow, authentication, payment, order creation, integration with external services, async messaging, call order between services or objects.'
---

# Sequence Diagrams

Load `docs-conventions` first. Output goes to `docs/flows/<scenario>.md`.

A sequence diagram shows the participants of **one scenario** and their interactions in chronological order. Document critical or non-obvious scenarios only.

## Workflow

1. **Ask** which scenario, its trigger, its expected outcome, and the reader. One scenario per diagram; split long flows.
2. **Trace the code** from the entry point (route, controller, handler, consumer, UI action) through services, repositories, HTTP clients, and message producers. Record each call, its payload, and its response.
3. **Ask the user** for what code cannot show: external systems' behavior, timeouts, retries, SLAs, business rules behind branches.
4. **Include** the main path, then significant alternatives (`alt`), optional steps (`opt`), loops, and error handling. Mark async calls distinctly.
5. **Choose** Mermaid (`sequenceDiagram`) or Archify (type `sequence`) using `docs-conventions`. Prefer Archify for more than about 6 participants or 20 messages.
6. **Draft**, show it, adjust, then write and update `docs/README.md`.

## Template

````markdown
# <Scenario name>

**Trigger:** <what starts it>. **Outcome:** <expected result>. **Reader:** <who>. **Last verified:** <YYYY-MM-DD>.

```mermaid
sequenceDiagram
  autonumber
  actor U as Customer
  participant W as Web App
  participant A as API
  participant P as Payment provider
  participant D as Database

  U->>W: Confirm order
  W->>A: POST /orders
  A->>D: Insert order (PENDING)
  A->>P: Create payment intent
  alt payment accepted
    P-->>A: 200 intent id
    A->>D: Update order (PAID)
    A-->>W: 201 order
  else payment refused
    P-->>A: 402 refused
    A->>D: Update order (FAILED)
    A-->>W: 422 payment_refused
  end
  A-)A: Publish OrderCreated (async)
```

## Steps

1. <Step number>: <what happens and why; code location `path/to/file.ts`>.

## Errors and Edge Cases

- <Failure>: <handling, retry, compensation>.
````

## Quality Checklist

- Participants are named after real components; actors are distinguished.
- Messages describe intent and protocol (`POST /orders`, `publish OrderCreated`).
- Responses and error branches are shown, not only the happy path.
- Async messages use a distinct arrow (`-)`).
- Steps reference code locations so the diagram can be checked.
