# Tutorial: your first feature

This tutorial follows a request from your prompt to the suggested commit. The example uses a NestJS API, but the workflow is the same for any stack.

## 1. Start from a clean worktree

Commit or stash pending changes first. The orchestrator pauses before a new feature when uncommitted changes remain, so you can commit them.

## 2. Ask the orchestrator

Select the `orchestrator` agent and describe the need:

```text
> Add pagination to GET /users
```

On the first feature, the orchestrator checks for a CodeGraph index and offers to build it.

## 3. Answer the clarifying questions

The orchestrator clarifies requirements that would change behavior — default page size, maximum, response shape — and records the answers in `.agents/memory.md`:

```markdown
## Project: users-api
## Status: PLANNING

## Clarified Requirements
- Default page size: 20
- Maximum page size: 100

## Business Features

| ID  | Feature                 | Status  | Delivery | Refactor |
|-----|-------------------------|---------|----------|----------|
| 001 | Paginate the user list  | PENDING | -        | -        |
```

## 4. Approve the features — gate 1

The orchestrator proposes small features and waits for your approval before starting each one.

## 5. Approve the spec — gate 2

Delivery calls `rules_for` with the files it plans to touch (here, with the NestJS rules installed by [`/rules-install`](../guides/install-rules)), then writes `.agents/spec.md`:

```markdown
# 001: Paginate the user list

## Acceptance
- AC-1: Given 45 users, when GET /users?page=2, then 20 users and pagination metadata are returned.
- AC-2: Given no page parameter, when GET /users, then the first page is returned.

## Edge Cases
- EC-1: pageSize above 100 -> 400 with errorCode INVALID_PAGE_SIZE.

## Rules
- nestjs/03-controller -> uses the shared paginator; returns `data` plus metadata.

## Coverage Plan
- AC-1 -> Implementation: users.service.ts; Verification: users.controller.spec.ts "returns page 2".
```

It then asks you to **Approve** or **Request changes**. Only an explicit `Approve` unlocks implementation.

## 6. Implementation and verification

Delivery implements the approved plan and the tests for every `AC-*` and `EC-*`. Refactor then:

- runs a scoped review and the returned rule checks,
- verifies each criterion with evidence,
- fixes directly related issues without changing the approved behavior,
- reports `PASS` or `NEEDS_ATTENTION`.

## 7. Review and commit

The orchestrator archives the spec to `.agents/archived/`, updates the memory, lists the changed files, and suggests a message:

```text
Changed files: src/users/users.controller.ts, src/users/users.service.ts, …
We strongly recommend reviewing and committing now:
  feat(users): paginate user list
```

You review, you commit. Then the orchestrator asks before starting the next feature.

## Going further

- [Workflow in detail](../concepts/workflow)
- [Review your changes with `/review`](../guides/code-review)
