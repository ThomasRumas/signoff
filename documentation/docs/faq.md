# FAQ

## Do I have to use the bundled rules?

No. They are opt-in: install them with [`/rules-install`](./guides/install-rules), write [your own](./guides/write-your-own-rules), or use neither. Without rules, agents and the review still work, they just have no team conventions to apply.

## My conventions differ from the bundled rules.

Install the stack and edit the files in `.opencode/rules/<stack>/`: they are your copies. Or write your own rules from scratch. See [Customize the rules](./guides/customize-rules).

## Will the AI commit for me?

Never. No agent stages, commits, amends, or pushes. The orchestrator lists the changed files and suggests a commit message.

## Which model is used?

The one configured in OpenCode. Open Code Review runs in delegation mode, so no OCR API key is needed.

## Where does my data go?

Everything stays local, except what your configured model receives. CodeGraph telemetry is disabled.

## Can I skip the approval gates?

No. Explicit approval of the spec is the only thing that unlocks implementation. It is the core of the developer-led workflow.

## Does `NEEDS_ATTENTION` block the workflow?

No. It records a gap so you can see it; the workflow continues through review and archiving.

## Should I commit `.agents/`?

No, it is local working state. Commit `.opencode/rules/` and `.opencodereview/rule.json` instead.

## Can I use only the reviewer?

Yes. `/review` and the `reviewer` agent are independent from the orchestrator workflow.
