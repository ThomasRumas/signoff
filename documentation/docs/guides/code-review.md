# Code review

The `reviewer` agent is standalone; it is not part of the orchestrator workflow. Use it to review any change — yours, a teammate's, or the agents'.

## Run a review

```text
/review
/review main..feature/pagination
/review a1b2c3d
```

`/review` switches the session to the `reviewer` agent and starts the review, optionally on a branch range or commit. You can also select the `reviewer` agent yourself.

## How it works

The reviewer uses [Open Code Review](https://github.com/alibaba/open-code-review) in **delegation mode**:

1. `ocr` selects the files to review and resolves the rules that apply to each one.
2. The OpenCode model performs the review — no OCR API key is required.
3. The reviewer reports findings with **file coverage** and severities, so you know nothing was skipped.
4. It proposes a **fix plan** and asks before applying any fix.

It never stages or commits.

The reviewer is the only agent that runs `ocr`. Other agents are told to route review requests to `/review` instead.

## Review with the team rules

Without configuration, OCR applies its built-in language rules. Install the team checks with [`/ocr-rules`](./ocr-rules) so the review applies the same rules the agents used to write the code.

## Prerequisites

Git 2.41 or later. The `ocr` CLI and the `open-code-review-delegate` skill ship with the plugin.
