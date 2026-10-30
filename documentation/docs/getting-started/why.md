# Why it matters

AI changed how code gets written. It did not change who is accountable for what ships. This page explains the reasoning behind Signoff: why control matters more than ever, why we center the product on team engineering rules, and why everything rests on practices developers already know.

## The job was never just code

Code is the most visible output of a developer, so it became the definition of the role. That was always reductive:

<StatGrid :items="[
  { value: '75%', label: 'say they have more responsibility for validating the quality and safety of AI-generated output' },
  { value: '87%', label: 'say AI helps them ship work faster' },
  { value: '80%', label: 'say AI helps them deliver more without working longer hours' },
  { value: '28%', label: 'experience noticeably less day-to-day friction than before AI' },
]" />

Source: [Atlassian, State of Developer Experience Report 2026](https://www.atlassian.com/fr/teams/software-development/state-of-developer-experience-2026).

The rest of the job — understanding the need, choosing the design, guarding security and compliance, testing, integrating, reviewing, releasing — is what turns code into a product. AI takes over more of the typing; it makes the rest of the job **more** important, not less.

The role is moving from production to judgment:

| Level | What AI should mean |
| --- | --- |
| Junior | Learn faster, without skipping understanding. |
| Engineer | Build and test, never trusting blindly. |
| Senior | A thinking partner that challenges decisions. |
| Staff | Reproducible AI workflows for teams. |
| Principal | AI as an organizational capability: quality gates, security, tooling strategy. |

## Faster code is not faster delivery

<StatGrid :items="[
  { value: '79%', label: 'agree individual developer productivity improved with AI, but delivery has not accelerated at the same pace' },
  { value: '85%', label: 'agree AI shifted the bottleneck from writing code to reviewing and validating it' },
  { value: '+98%', label: 'pull requests merged per developer from low to high AI adoption' },
  { value: '+154%', label: 'average pull request size from low to high AI adoption' },
  { value: '+91%', label: 'median review time from low to high AI adoption' },
]" />

Sources: [GitLab AI research](https://about.gitlab.com/press/releases/2026-06-23-gitlab-research-reveals-organizations-are-generating-ai-code-faster-than-they-can-control-it/) and [Faros AI's report (PDF)](https://manuals.plus/m/ad0c48e6b1e189eae1286aa5d762871c8004e62e8be25db4def25978ac58cb00.pdf).

The chain is predictable: more AI-driven development makes review the bottleneck; unreviewed AI code causes more incidents; the people on call lack the context to fix them; fixes arrive late. Tests, security, integration, review, and release still decide delivery.

## Trust is the gap

<StatGrid :items="[
  { value: '49%', label: 'of developers spend 4+ hours per week reviewing AI output, correcting prompts, and more' },
  { value: '82%', label: 'say AI-generated code risks technical debt their organization is not ready to manage' },
  { value: '84%', label: 'agree the biggest challenge is governing what happens to AI-generated code after it is created' },
  { value: '34%', label: 'of organizations that experienced an incident in the past year could not determine whether AI-generated code contributed' },
]" />

Sources: [Atlassian, State of Developer Experience Report 2026](https://www.atlassian.com/fr/teams/software-development/state-of-developer-experience-2026) and [GitLab AI research](https://about.gitlab.com/press/releases/2026-06-23-gitlab-research-reveals-organizations-are-generating-ai-code-faster-than-they-can-control-it/).

Some engineers now describe their own systems as black boxes: code they shipped but don't fully understand. That goes against every instinct of the profession.

## Accountability requires control

When something breaks, the developer answers for it. Accountability without control is a bet, so the plugin divides the work by risk:

| Agents carry the volume | You keep the decisions |
| --- | --- |
| Boilerplate | Business logic |
| Tests | Security boundaries |
| Documentation updates | Architecture decisions |
| Repetitive transformations | Behavior with customer or regulatory impact |

And it structures every feature around the same loop:

| Step | Who | In the plugin |
| --- | --- | --- |
| **Define** intent, scope, acceptance | You | Clarifying questions, feature approval |
| **Plan** and expose assumptions | Agent | Delivery writes `spec.md` |
| **Approve** the plan | You | Explicit `Approve` on the spec |
| **Implement** within agreed limits | Agent | Delivery implements the approved paths only |
| **Verify** automatically | Agent | Refactor checks each `AC-*`, `EC-*`, and rule |
| **Decide** | You | Review the changes and commit |

AI multiplies judgment. It does not remove the need for it.

## Your job moves to the spec and the understanding

When AI writes more of the code, a developer's value is in what it can't own: a spec that says exactly what must be true, and an understanding of the system deep enough to answer for it. The plugin gives you an agent for each:

| Your responsibility | Agent | How it helps |
| --- | --- | --- |
| **Own the spec** | Orchestrator and Delivery | Every feature gets a written spec with acceptance criteria and edge cases. Archived specs keep what was built and why. |
| **Trust, but verify** | [Reviewer](../guides/code-review) | `/review` applies your team rules with Open Code Review, covers every changed file, ranks findings by severity, and proposes a fix plan you approve: a first check before your own. |
| **Keep the understanding** | [Documentation](../guides/documentation) | Architecture (C4), decisions (ADR), feature flows (sequence), data models (ERD): written from the code, approved by you, kept in the repository. |

The code may be generated. The intent, the verification, and the knowledge stay with the team.

## Context is the multiplier

A useful result needs three things: a capable model, relevant context, and human judgment. The model is the part you control least. Context is where most failures come from: knowledge is scattered across code, docs, tickets, and people, while the agent sees only code.

Useful context has four layers. The plugin covers each one:

| Layer | Content | In the plugin |
| --- | --- | --- |
| **Project** | Requirements, decisions, related work | `.agents/memory.md` and archived specs |
| **Repository** | Conventions, architecture, commands | Engineering rules, served by `rules_for`; CodeGraph |
| **Task** | The change, its scope, what's out of scope | `spec.md`: outcome, exclusions, paths |
| **Verification** | How to prove the result is right | `AC-*`, `EC-*`, coverage plan, Refactor report |

Fine-tuning a model changes its behavior, not its knowledge of your task. Clarify first, improve instructions, connect knowledge sources, then strengthen verification.

## Why team engineering rules

<StatGrid :items="[
  { value: '80%', label: 'agree their organization adopted AI tools faster than it developed policies to govern them' },
  { value: '92%', label: 'report some form of governance challenge with AI-generated code' },
  { value: '82%', label: 'say AI-generated code risks technical debt their organization is not ready to manage' },
]" />

Source: [GitLab AI Accountability research, conducted by The Harris Poll](https://about.gitlab.com/press/releases/2026-06-23-gitlab-research-reveals-organizations-are-generating-ai-code-faster-than-they-can-control-it/).

Organizations that scale well **standardize the decisions that should not be repeated**, and make the approved path the easiest path. Engineering rules do exactly that for AI-assisted development.

**Durable knowledge belongs in rules; changing intent belongs in the task.**

| Rules (durable) | Spec (per task) |
| --- | --- |
| Conventions and boundaries | The requested change and its scope |
| Build, test, and lint expectations | What is out of scope |
| Mandatory checks before a change | Acceptance criteria and edge cases |
| Specific, current, close to the code | Exact paths and verification plan |

Why rules rather than a bigger prompt or a single instructions file:

- **Decide once.** A convention is written once and applied by every agent, for every developer, on every feature.
- **Explain the why.** Each decision records its context, rationale, and alternatives, so agents apply it with judgment and humans learn from it.
- **Govern like code.** Rules are versioned, reviewed in pull requests, and overridable per project.
- **Stay focused.** Only the checks for the touched files enter the context.
- **Close the loop.** The same rules guide implementation and review, locally and in CI.

Instructions shape behavior; they don't guarantee correctness. That is why rules are always paired with verification: Refactor checks them, and `/review` applies them again.

## Onboard AI like a new developer

When a developer joins a company, nobody expects them to be effective on day one by guessing. We onboard them: the company's rules, the team's engineering conventions, the architecture decisions and, above all, the reasons behind them. A few weeks later, they write code that looks like the team's code.

AI agents start every session as that newcomer, without the onboarding. The plugin gives them the same path:

| What a new developer learns | What the agents get |
| --- | --- |
| Company and team conventions | Engineering rules, served by `rules_for` |
| Why things are done this way | Decisions with context, rationale, and alternatives |
| What the project is about and what was decided | Project memory and archived specs |
| How work gets reviewed and accepted | Acceptance criteria, Refactor verification, `/review` |

The same rules then onboard your next human teammate too.

## A method, not the method

This plugin encodes one way of working: clarify, specify, approve, verify. It could just as well have been test-first, with agents writing failing tests from the acceptance criteria before any production code, or any other method your team trusts.

The workflow is not the point. The point is to show that AI can follow a team's method instead of improvising its own, and that developers can decide what that method is. Take this one as an example: adopt it, bend it, or replace it with yours. Agents are Markdown files, rules are Markdown files, and both can be changed like any other code.

## Standing on proven tools

The plugin doesn't start from scratch. It assembles open-source tools you may already know:

| Tool | Role in the plugin |
| --- | --- |
| [OpenCode](https://opencode.ai) | The open-source coding agent the plugin extends. |
| [Open Code Review](https://github.com/alibaba/open-code-review) by Alibaba | Applies your team rules during code review, locally and in CI. |
| [grill-me](https://github.com/mattpocock/skills) by Matt Pocock | Stress-tests requirements before anything is planned. |
| [Archify](https://github.com/tt-a1i/archify) | Turns architecture and workflows into explorable diagrams. |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | Indexes the code so agents query a graph instead of reading files. |
| [Ponytail](https://www.npmjs.com/package/@dietrichgebert/ponytail) | Provides the scoped review used by the Refactor agent. |

## About the author

I'm Thomas Rumas, Developer Advocate. My job is helping developers adopt practices that last, and onboarding is where it starts. This plugin is what I would teach any new teammate, written down so agents can learn it too.

I write about developer experience, engineering practices, and AI on my blog: [thomas.rumas.fr](https://thomas.rumas.fr).

## Built on the fundamentals

Nothing here is new. The plugin brings the practices good teams already use to AI-assisted work:

| Proven practice | How the plugin applies it |
| --- | --- |
| Small batches, user stories | Requests split into small, approved features |
| Given / When / Then | Acceptance criteria `AC-*` |
| Boundary and negative testing | Edge cases `EC-*` |
| Design review before coding | Spec approval gate |
| Definition of Done | Coverage plan, verified criterion by criterion |
| Separation of author and reviewer | Delivery implements, Refactor verifies |
| Coding standards and review checklists | Engineering checks, also used by the review |
| Architecture Decision Records | Versioned decisions with status and rationale |
| Atomic, conventional commits | One feature, one suggested commit |
| Shared team knowledge | Project memory and engineering rules in the repo |

## In short

1. The developer's job was never just code; AI makes that visible.
2. The bottleneck moved from writing to reviewing and verifying.
3. Developers remain accountable for what ships, so they need control at every risky step.
4. Context is the multiplier, and team engineering rules are the most durable context you have.
5. None of this is new: it is good engineering, applied to agents.
6. It is one method among others; the goal is to show that agents can follow yours.

[Install the plugin →](./installation) · [Deliver your first feature →](./first-feature)

---

<small>The figures on this page come from what I learned at the Platform Engineering & Developer Experience Summit in London, 2026: industry surveys and field reports presented during the talks. Speakers included Lloyds Banking Group, SEB, Sourcegraph, IKEA (Ingka Group), Saint-Gobain, GitLab, and RWS.</small>
