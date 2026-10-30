<script setup lang="ts">
import { withBase } from "vitepress"
import { data as stacks } from "../../rules.data"
import TerminalDemo from "../TerminalDemo.vue"
import DotMatrix from "./DotMatrix.vue"
import Highlights from "./Highlights.vue"
import Ribbon from "./Ribbon.vue"
import TitleBlock from "./TitleBlock.vue"

const checks = Object.fromEntries(stacks.map((stack) => [stack.id, stack.checks]))
const documents = stacks.reduce((total, stack) => total + stack.documents, 0)

const reviewLoad = [
  { label: "PRs merged per developer", value: 98 },
  { label: "Average pull request size", value: 154 },
  { label: "Median review time", value: 91 },
]

const split = [
  ["Boilerplate and repetitive transformations", "Business logic"],
  ["Tests for the criteria you approved", "Security boundaries"],
  ["Documentation updates", "Architecture decisions"],
  ["Applying team conventions file by file", "Behavior with customer or regulatory impact"],
]

const steps = [
  { title: "You define the need", text: "The orchestrator asks the questions that change behavior and records the answers.", you: true, gate: false },
  { title: "You approve the features", text: "The request is split into small features. Each one waits for your go-ahead.", you: true, gate: true },
  { title: "Delivery writes the spec", text: "Exact paths, acceptance criteria, edge cases, applied rules, coverage plan.", you: false, gate: false },
  { title: "You approve the spec", text: "Only an explicit Approve unlocks implementation.", you: true, gate: true },
  { title: "Agents build and verify", text: "Delivery implements and tests. Refactor checks every criterion and rule, with evidence.", you: false, gate: false },
  { title: "You commit", text: "Changed files listed, commit message suggested. History stays yours.", you: true, gate: false },
]

const duties = [
  {
    title: "Own the spec",
    agent: "Orchestrator and Delivery agents",
    text: "Every feature gets a written spec with its acceptance criteria and edge cases. Archived specs record what was built and why, so the intent survives the chat.",
    link: "/concepts/acceptance",
    linkText: "How specs work",
  },
  {
    title: "Trust, but verify",
    agent: "Reviewer agent",
    text: "/review runs Open Code Review with your team rules, covers every changed file, ranks findings by severity and proposes a fix plan you approve. A first check before your own.",
    link: "/guides/code-review",
    linkText: "How review works",
  },
  {
    title: "Keep the understanding",
    agent: "Documentation agent",
    text: "Architecture, decisions, how a feature flows, the data model: written from the code, approved by you, kept in the repository. The knowledge stays when the context window doesn't.",
    link: "/guides/documentation",
    linkText: "How documentation works",
  },
]

const governance = [
  { value: "80%", label: "agree their organization adopted AI tools faster than it developed policies to govern them." },
  { value: "92%", label: "report some form of governance challenge with AI-generated code." },
  { value: "82%", label: "say AI-generated code risks a new kind of technical debt they are not ready to manage." },
]

const reasons = [
  { title: "Decide once", text: "A convention written once applies to every feature, every agent, every developer." },
  { title: "Say why", text: "Each decision keeps its context and rejected alternatives. Agents apply it with judgment; newcomers learn the reasoning." },
  { title: "Version it like code", text: "Markdown in your repository, changed through pull requests, overridable per project." },
  { title: "Load only what matters", text: "Only the checks for the files being touched enter the context." },
  { title: "Write and review with the same rules", text: "What guided the implementation is exactly what the review checks, locally and in CI." },
  { title: "Keep tasks and knowledge apart", text: "Rules hold what stays true. The spec holds what changes with each request." },
]

const compare = [
  ["Start of session", "You re-explain the project and past decisions.", "Memory restores requirements, features and statuses."],
  ["Clarifying the need", "It guesses and starts coding.", "It asks what changes behavior and records the answers."],
  ["Scoping", "One prompt, one sprawling change.", "Small features, approved one by one."],
  ["Planning", "The plan, if any, lives in the chat.", "A written spec you approve before any code."],
  ["Writing code", "Internet-average conventions.", "Your team's checks, for exactly the files touched."],
  ["Tests", "Optional, often happy path only.", "A test for every acceptance criterion and edge case."],
  ["Verification", "The author grades its own work.", "A separate agent verifies each criterion, with evidence."],
  ["Review", "Generic, may skip files.", "Your rules, file-by-file coverage, fixes after approval."],
  ["Commit", "Sometimes commits on its own.", "Files listed, message suggested. You commit."],
  ["Next session", "Context is gone.", "Spec archived, memory updated. Work resumes."],
]

const practices = [
  ["Small batches, user stories", "Requests split into small, approved features"],
  ["Given / When / Then", "Acceptance criteria AC-*"],
  ["Boundary and negative testing", "Edge cases EC-*"],
  ["Design review before coding", "Spec approval"],
  ["Definition of Done", "Coverage plan, verified criterion by criterion"],
  ["Separate author and reviewer", "Delivery implements, Refactor verifies"],
  ["Coding standards, review checklists", "Engineering checks, reused by the review"],
  ["Architecture Decision Records", "Versioned decisions with status and rationale"],
  ["Atomic, conventional commits", "One feature, one suggested commit"],
  ["Shared team knowledge", "Project memory and rules in the repository"],
]

const tools = [
  { name: "OpenCode", url: "https://opencode.ai", role: "The open-source coding agent the plugin extends." },
  { name: "Open Code Review by Alibaba", url: "https://github.com/alibaba/open-code-review", role: "Applies your team rules during code review, locally and in CI." },
  { name: "grill-me by Matt Pocock", url: "https://github.com/mattpocock/skills", role: "Stress-tests requirements before anything is planned." },
  { name: "Archify", url: "https://github.com/tt-a1i/archify", role: "Turns architecture and workflows into explorable diagrams." },
  { name: "CodeGraph", url: "https://github.com/colbymchenry/codegraph", role: "Indexes the code so agents query a graph instead of reading files." },
]

const faq = [
  ["Isn't this slower than letting the AI code?", "Approving a feature and a spec takes minutes. Rewriting a change that ignored your conventions, missed an edge case or touched 14 files takes hours, and the review pays the bill."],
  ["We already have an AGENTS.md.", "Keep it. A single instructions file is loaded whole, rarely explains why, and is not used by the review. Team rules are served per file, carry their rationale, and drive both implementation and review."],
  ["Our conventions differ from yours.", "They should be yours. Override any rule in .opencode/rules/ or add your own stack."],
  ["Will the AI commit for me?", "Never. It suggests the message; you decide."],
  ["Where does my code go?", "Only to the model you configured in OpenCode. Everything else stays local, and CodeGraph telemetry is off."],
]
</script>

<template>
  <div class="lp">
    <Ribbon />

    <section id="top" class="ch dark hero">
      <h1>You own what ships.</h1>
      <p class="sub">AI writes the code. You keep the decisions. An OpenCode plugin that puts your approval, your criteria and your team's engineering rules on every change.</p>
      <div class="actions">
        <a class="btn primary" href="#quick-start">Install the plugin</a>
        <a class="btn" :href="withBase('/getting-started/why')">Why it matters</a>
      </div>
      <TitleBlock class="hero-block" />
    </section>

    <section id="overview" class="ch light">
      <h2>Everything a careful developer would do. Now your agents do it too.</h2>
      <Highlights />
      <div id="quick-start" class="quick">
        <h2 class="follow">Ready in two minutes.</h2>
        <div class="start">
          <ol class="start-steps">
            <li>
              <h3>Install the plugin</h3>
              <pre><code>opencode plugin add @thomasrumas/signoff</code></pre>
            </li>
            <li>
              <h3>Restart OpenCode and prepare the project</h3>
              <pre><code>/codegraph-init
/rules-install</code></pre>
              <p>Both optional: index the code, install the review rules.</p>
            </li>
            <li>
              <h3>Ask the orchestrator</h3>
              <pre><code>&gt; Add pagination to GET /users</code></pre>
            </li>
          </ol>
          <TerminalDemo />
        </div>
        <p class="center"><a class="link" :href="withBase('/getting-started/installation')">Full installation guide</a></p>
      </div>
    </section>

    <section id="the-shift" class="ch dark">
      <h2 class="kicker">The job was never just code.</h2>
      <p class="mega">75%</p>
      <p class="mega-label">of developers say they have more responsibility for validating the quality and safety of AI-generated output.</p>
      <div class="pair">
        <p><strong>79%</strong> agree individual developer productivity has improved with AI, but overall software delivery has not accelerated at the same pace.</p>
        <p><strong>85%</strong> agree AI has shifted the bottleneck from writing code to reviewing and validating it.</p>
      </div>
      <h2 class="follow">AI made code cheap. Review pays for it.</h2>
      <div class="dims">
        <div v-for="bar in reviewLoad" :key="bar.label" class="dim">
          <span class="dim-label">{{ bar.label }}</span>
          <span class="dim-line" :style="{ width: `${(bar.value / 154) * 100}%` }">
            <span class="dim-value">+{{ bar.value }}%</span>
          </span>
        </div>
      </div>
      <p class="note">Changes from low to high AI adoption: more PRs, larger PRs, and longer median reviews. The same person signs off at the end.</p>
      <p class="stat-source">
        Sources:
        <a class="link" href="https://www.atlassian.com/fr/teams/software-development/state-of-developer-experience-2026" target="_blank" rel="noopener">Atlassian, State of Developer Experience 2026</a>,
        <a class="link" href="https://about.gitlab.com/press/releases/2026-06-23-gitlab-research-reveals-organizations-are-generating-ai-code-faster-than-they-can-control-it/" target="_blank" rel="noopener">GitLab AI research</a>,
        <a class="link" href="https://manuals.plus/m/ad0c48e6b1e189eae1286aa5d762871c8004e62e8be25db4def25978ac58cb00.pdf" target="_blank" rel="noopener">Faros AI report (PDF)</a>.
      </p>
    </section>

    <section class="ch light trust">
      <div class="trust-text">
        <h2>AI has not removed day-to-day friction.</h2>
        <p class="lead"><strong>49%</strong> of developers spend 4+ hours per week reviewing AI output, correcting prompts, and more.</p>
        <p>Only 28% say they experience noticeably less friction across their day-to-day workflow than before AI.</p>
        <p class="stat-source">
          Source:
          <a class="link" href="https://www.atlassian.com/fr/teams/software-development/state-of-developer-experience-2026" target="_blank" rel="noopener">Atlassian, State of Developer Experience 2026</a>.
        </p>
      </div>
      <figure class="trust-dots">
        <DotMatrix :filled="28" />
        <figcaption>28 out of 100 developers report noticeably less day-to-day friction than before AI.</figcaption>
      </figure>
    </section>

    <section id="control" class="ch dark">
      <h2>When production breaks, nobody asks which model wrote the line.</h2>
      <p class="sub">You answer for the logic, the security, the architecture and what customers see. Accountability without control is a bet. So the work is split where the risk is.</p>
      <div class="split">
        <div>
          <h3>Agents carry the volume</h3>
          <ul><li v-for="row in split" :key="row[0]">{{ row[0] }}</li></ul>
        </div>
        <div>
          <h3>You keep the decisions</h3>
          <ul><li v-for="row in split" :key="row[1]">{{ row[1] }}</li></ul>
        </div>
      </div>
    </section>

    <section class="ch light grid-bg">
      <h2>Two signatures before any code ships.</h2>
      <ol class="track">
        <li v-for="(step, index) in steps" :key="step.title" :class="{ gate: step.gate, you: step.you }">
          <span class="num">{{ index + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </li>
      </ol>
      <p class="center"><a class="link" :href="withBase('/concepts/workflow')">How the workflow runs</a></p>
    </section>

    <section id="job" class="ch dark">
      <h2>Your job moves to the spec and the understanding.</h2>
      <p class="sub">
        When AI writes more of the code, your value is in what it can't own: a spec that says exactly what must be true,
        and an understanding of the system deep enough to answer for it. The plugin helps you keep both.
      </p>
      <div class="duties">
        <div v-for="duty in duties" :key="duty.title">
          <h3>{{ duty.title }}</h3>
          <p class="agent">{{ duty.agent }}</p>
          <p>{{ duty.text }}</p>
          <a class="link" :href="withBase(duty.link)">{{ duty.linkText }}</a>
        </div>
      </div>
    </section>

    <section id="rules" class="ch light">
      <h2>AI arrived before the rules.</h2>
      <dl class="ledger">
        <div v-for="row in governance" :key="row.value">
          <dt>{{ row.value }}</dt>
          <dd>{{ row.label }}</dd>
        </div>
      </dl>
      <p class="stat-source">
        Source:
        <a class="link" href="https://about.gitlab.com/press/releases/2026-06-23-gitlab-research-reveals-organizations-are-generating-ai-code-faster-than-they-can-control-it/" target="_blank" rel="noopener">GitLab AI Accountability research, conducted by The Harris Poll</a>.
      </p>
      <p class="sub">Governance can't be a document nobody reads. It has to live where the code is written, and be applied every time.</p>
    </section>

    <section class="ch dark">
      <h2>Onboard your agents like a new teammate.</h2>
      <p class="sub">
        When a developer joins, nobody hands them a keyboard and walks away. We teach them the company's rules, the team's
        engineering conventions and the reasons behind them. That is what makes them effective. Your agents deserve the same onboarding.
      </p>
      <div class="rule-sheet">
        <pre><code><span class="c">---</span>
<span class="k">title:</span> NestJS controller (transport boundary).
<span class="k">globs:</span> ["**/*.controller.ts"]
<span class="k">sources:</span>
  - engineering-rules/design/001-business-oriented-api-design.md
  - engineering-rules/observability/002-controller-error-translation.md
<span class="c">---</span>
- Keep handlers thin: bind and validate input, translate
  results and errors, return the service result.
- Responses MUST be project-owned response DTOs.
- Collection endpoints use the shared paginator.</code></pre>
        <ul class="callouts">
          <li><strong>globs</strong> Served only when a controller is touched.</li>
          <li><strong>sources</strong> The reasoning behind each line, one click away.</li>
          <li><strong>checklist</strong> Applied by Delivery, verified by Refactor, checked again by /review.</li>
        </ul>
      </div>
      <dl class="reasons">
        <div v-for="reason in reasons" :key="reason.title">
          <dt>{{ reason.title }}</dt>
          <dd>{{ reason.text }}</dd>
        </div>
      </dl>
      <p class="counts">
        Shipped with <strong>{{ checks.nestjs }}</strong> NestJS checks, <strong>{{ checks.vue }}</strong> Vue checks and
        <strong>{{ documents }}</strong> rules and decisions from years of production work.
        <a class="link" :href="withBase('/rules/')">Browse the rules</a>
      </p>
    </section>

    <section id="compare" class="ch light">
      <h2>What changes, step by step.</h2>
      <div class="compare" role="table" aria-label="General-purpose AI agent compared with Signoff">
        <div class="compare-row compare-head" role="row">
          <span role="columnheader">Step</span>
          <span role="columnheader">General-purpose AI agent</span>
          <span role="columnheader">With Signoff</span>
        </div>
        <div v-for="row in compare" :key="row[0]" class="compare-row" role="row">
          <span role="rowheader">{{ row[0] }}</span>
          <span role="cell" class="without">{{ row[1] }}</span>
          <span role="cell" class="with">{{ row[2] }}</span>
        </div>
      </div>
    </section>

    <section class="ch dark">
      <h2>A method, not the method.</h2>
      <p class="sub">
        This plugin encodes one way of working: clarify, specify, approve, verify. It could just as well have been test-first,
        with agents writing failing tests before any code. The point is not this workflow. The point is that AI can follow
        your team's method instead of improvising its own. Take it, bend it, replace it.
      </p>
      <div class="author">
        <p>
          I'm Thomas Rumas, Developer Advocate. My job is helping developers adopt practices that last, and onboarding is where
          it starts. This plugin is what I would teach any new teammate, written down so agents can learn it too.
        </p>
        <a class="btn" href="https://thomas.rumas.fr" target="_blank" rel="noopener">Read my blog</a>
      </div>
    </section>

    <section class="ch light">
      <h2>Nothing here is new. That's the point.</h2>
      <p class="sub">The plugin brings to AI the practices good teams already rely on. Seniors will recognize them, juniors will learn them, and agents will finally follow them.</p>
      <table class="legend">
        <thead><tr><th>Proven practice</th><th>In the plugin</th></tr></thead>
        <tbody>
          <tr v-for="row in practices" :key="row[0]"><td>{{ row[0] }}</td><td>{{ row[1] }}</td></tr>
        </tbody>
      </table>
      <h3 class="tools-title">Built on tools you may already know</h3>
      <ul class="tools">
        <li v-for="tool in tools" :key="tool.name">
          <a :href="tool.url" target="_blank" rel="noopener">{{ tool.name }}</a>
          <span>{{ tool.role }}</span>
        </li>
      </ul>
    </section>

    <section class="ch dark final">
      <h2>Sign off on every change.</h2>
      <p class="sub">Let the agents write. Keep the decisions.</p>
      <div class="actions">
        <a class="btn primary" :href="withBase('/getting-started/installation')">Install the plugin</a>
        <a class="btn" :href="withBase('/getting-started/introduction')">Read the documentation</a>
      </div>
    </section>

    <section class="ch light">
      <h2>Questions you're probably asking.</h2>
      <div class="faq">
        <details v-for="item in faq" :key="item[0]">
          <summary>{{ item[0] }}</summary>
          <p>{{ item[1] }}</p>
        </details>
      </div>
    </section>

    <aside class="origin">
      <p>
        Survey and telemetry sources:
        <a href="https://www.atlassian.com/fr/teams/software-development/state-of-developer-experience-2026" target="_blank" rel="noopener">Atlassian</a> surveyed 1,500+ software practitioners;
        <a href="https://about.gitlab.com/press/releases/2026-06-23-gitlab-research-reveals-organizations-are-generating-ai-code-faster-than-they-can-control-it/" target="_blank" rel="noopener">GitLab's AI Accountability research</a>, conducted by The Harris Poll, surveyed 1,528 developers and technology buyers across six countries;
        <a href="https://manuals.plus/m/ad0c48e6b1e189eae1286aa5d762871c8004e62e8be25db4def25978ac58cb00.pdf" target="_blank" rel="noopener">Faros AI's report</a> analyzes telemetry from 1,255 teams and more than 10,000 developers.
      </p>
    </aside>
  </div>
</template>

<style scoped>
.lp {
  --measure: 68ch;
  overflow-x: clip;
  font-family: var(--vp-font-family-base);
}

.ch {
  padding: clamp(80px, 12vw, 160px) 24px;
  text-align: center;
  scroll-margin-top: calc(var(--vp-nav-height) + 52px);
}
.ch > * {
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
}
.dark {
  background: var(--blueprint);
  color: #e6eef5;
}
.light {
  background: var(--paper);
  color: var(--graphite);
}

h1,
h2 {
  font-stretch: 125%;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.02;
  text-wrap: balance;
}
h1 {
  font-size: clamp(3rem, 10vw, 8.5rem);
  color: #fff;
}
h2 {
  font-size: clamp(2.1rem, 5.6vw, 4.6rem);
  margin-bottom: 0;
}
h3 {
  font-size: 1.15rem;
  font-weight: 700;
  font-stretch: 110%;
  margin: 0;
}
p {
  line-height: 1.6;
}
.sub {
  max-width: 44rem;
  margin-top: 28px;
  font-size: clamp(1.1rem, 1.8vw, 1.35rem);
  color: inherit;
  opacity: 0.85;
}
.center {
  margin-top: 48px;
}

.hero {
  min-height: calc(100vh - var(--vp-nav-height) - 52px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 72px;
  background:
    linear-gradient(rgba(124, 196, 232, 0.07) 1px, transparent 1px) 0 0 / 32px 32px,
    linear-gradient(90deg, rgba(124, 196, 232, 0.07) 1px, transparent 1px) 0 0 / 32px 32px,
    var(--blueprint);
}
.hero h1 {
  margin-top: 0;
  margin-bottom: 0;
}
.hero-block {
  margin-top: 72px;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 40px;
}
.btn {
  padding: 14px 28px;
  border-radius: 999px;
  border: 1.5px solid rgba(230, 238, 245, 0.55);
  color: #fff;
  font-weight: 650;
  font-size: 1.05rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.08);
}
.btn.primary {
  background: var(--paper);
  border-color: var(--paper);
  color: var(--blueprint);
}
.btn.primary:hover {
  background: #fff;
}
.btn:focus-visible,
.link:focus-visible,
summary:focus-visible {
  outline: 3px solid var(--line-cyan);
  outline-offset: 3px;
}
.link {
  font-weight: 650;
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 5px;
  text-decoration-color: var(--line-cyan);
}
.light .link {
  text-decoration-color: var(--vp-c-brand-1);
}

.kicker {
  font-size: clamp(1.6rem, 3.4vw, 2.6rem);
}
.mega {
  margin: 8px auto 0;
  font-size: clamp(8rem, 30vw, 22rem);
  font-weight: 900;
  font-stretch: 125%;
  letter-spacing: -0.05em;
  line-height: 0.9;
  color: var(--blueprint);
}
.mega-label {
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 600;
}
.pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 40px;
  max-width: 820px;
  margin-top: 72px;
  text-align: left;
}
.pair p {
  margin: 0;
  padding-top: 18px;
  border-top: 2px solid var(--graphite);
  font-size: 1.1rem;
}
.pair strong {
  display: block;
  font-size: 3rem;
  font-stretch: 125%;
  font-weight: 800;
  line-height: 1.1;
}
.dark .mega,
.dark .pair strong {
  color: #fff;
}
.dark .pair p {
  border-top-color: var(--line-cyan);
  color: #c4d6e4;
}
.follow {
  margin-top: clamp(96px, 12vw, 160px);
}

.dims {
  display: grid;
  gap: 44px;
  margin-top: 80px;
  text-align: left;
}
.dim-label {
  display: block;
  margin-bottom: 14px;
  font-size: 1.05rem;
  color: #a9c3d6;
}
.dim-line {
  position: relative;
  display: block;
  height: 2px;
  min-width: 140px;
  background: var(--line-cyan);
}
.dim-line::before,
.dim-line::after {
  content: "";
  position: absolute;
  top: -10px;
  width: 2px;
  height: 22px;
  background: var(--line-cyan);
}
.dim-line::before {
  left: 0;
}
.dim-line::after {
  right: 0;
}
.dim-value {
  position: absolute;
  right: 0;
  bottom: 12px;
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 800;
  font-stretch: 125%;
  line-height: 1;
  color: #fff;
}
.note {
  margin-top: 64px;
  font-size: 1.2rem;
  color: #a9c3d6;
}

.trust {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 64px;
  align-items: center;
  max-width: none;
  text-align: left;
}
.trust > * {
  margin: 0;
}
.trust-text {
  justify-self: end;
  max-width: 34rem;
}
.trust .lead {
  margin-top: 24px;
  font-size: 1.6rem;
  font-weight: 700;
  font-stretch: 112%;
}
.trust-dots {
  color: var(--blueprint);
}
.trust-dots figcaption {
  margin-top: 16px;
  font-size: 0.95rem;
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 900px;
  margin-top: 72px;
  text-align: left;
  border-top: 2px solid var(--line-cyan);
}
.split > div {
  padding: 28px 28px 0 0;
}
.split > div + div {
  padding-left: 28px;
  border-left: 1px solid rgba(124, 196, 232, 0.45);
}
.split h3 {
  color: var(--line-cyan);
}
.split > div + div h3 {
  color: #fff;
}
.split ul {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
}
.split li {
  padding: 12px 0;
  border-bottom: 1px solid rgba(124, 196, 232, 0.2);
  font-size: 1.05rem;
}

.duties {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 40px;
  margin-top: 72px;
  text-align: left;
}
.duties > div {
  padding-top: 24px;
  border-top: 2px solid var(--line-cyan);
}
.duties h3 {
  font-size: 1.4rem;
  color: #fff;
}
.duties .agent {
  margin: 6px 0 0;
  font-size: 0.92rem;
  color: var(--line-cyan);
}
.duties p:not(.agent) {
  margin: 14px 0 18px;
  color: #c4d6e4;
}

.grid-bg {
  background:
    linear-gradient(rgba(15, 39, 66, 0.06) 1px, transparent 1px) 0 0 / 32px 32px,
    linear-gradient(90deg, rgba(15, 39, 66, 0.06) 1px, transparent 1px) 0 0 / 32px 32px,
    var(--paper);
}
.track {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  list-style: none;
  padding: 0;
  margin-top: 80px;
  text-align: left;
  counter-reset: none;
}
.track li {
  position: relative;
  padding: 0 18px 0 0;
  border-top: 2px solid var(--blueprint);
}
.num {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: -23px 0 22px;
  border-radius: 50%;
  border: 2px solid var(--blueprint);
  background: var(--paper);
  font-weight: 800;
  font-stretch: 120%;
}
.track .you .num {
  border-color: var(--approval-red);
  color: var(--approval-red);
}
.track .gate .num {
  border: 3px double var(--approval-red);
}
.track .you h3 {
  color: var(--approval-red);
}
.track p {
  margin-top: 8px;
  font-size: 0.95rem;
  color: #4a5361;
}

.ledger {
  max-width: 900px;
  margin-top: 72px;
  text-align: left;
  border-top: 2px solid var(--blueprint);
}
.ledger > div {
  display: grid;
  grid-template-columns: minmax(7rem, 14rem) 1fr;
  gap: 32px;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid rgba(15, 39, 66, 0.2);
}
.ledger dt {
  font-size: clamp(3.5rem, 9vw, 4.5rem);
  font-weight: 900;
  font-stretch: 125%;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--blueprint);
}
.ledger dd {
  margin: 0;
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  font-weight: 600;
  line-height: 1.4;
}
@media (max-width: 640px) {
  .ledger > div {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
.rule-sheet {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  margin-top: 72px;
  text-align: left;
  border: 2px solid var(--line-cyan);
}
.rule-sheet pre {
  margin: 0;
  padding: 24px;
  overflow-x: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.7;
  color: #dcecf6;
  background: rgba(0, 0, 0, 0.18);
}
.rule-sheet .k {
  color: var(--line-cyan);
}
.rule-sheet .c {
  color: #6f8aa3;
}
.callouts {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 1px solid rgba(124, 196, 232, 0.45);
}
.callouts li {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(124, 196, 232, 0.25);
  color: #c4d6e4;
}
.callouts li:last-child {
  border-bottom: none;
}
.callouts strong {
  display: block;
  margin-bottom: 4px;
  font-family: var(--vp-font-family-mono);
  color: var(--line-cyan);
}
.reasons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px 48px;
  margin-top: 80px;
  text-align: left;
}
.reasons dt {
  font-size: 1.2rem;
  font-weight: 700;
  font-stretch: 112%;
  color: #fff;
}
.reasons dd {
  margin: 8px 0 0;
  line-height: 1.6;
  color: #b9cddc;
}
.counts {
  margin-top: 72px;
  font-size: 1.15rem;
}
.counts strong {
  color: #fff;
}

.compare {
  margin-top: 64px;
  text-align: left;
  border-top: 2px solid var(--graphite);
}
.compare-row {
  display: grid;
  grid-template-columns: 11rem 1fr 1fr;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(35, 39, 46, 0.15);
}
.compare-head {
  font-size: 0.9rem;
  font-weight: 700;
  color: #4a5361;
}
.compare-row > span:first-child {
  font-weight: 700;
}
.without {
  color: #6b7380;
  text-decoration: line-through;
  text-decoration-color: rgba(107, 115, 128, 0.5);
}
.compare-head .without,
.compare-head span {
  text-decoration: none;
}
.with {
  color: var(--blueprint);
  font-weight: 600;
}

.legend {
  display: table;
  width: 100%;
  max-width: 900px;
  margin-top: 56px;
  border-collapse: collapse;
  text-align: left;
  border: 2px solid var(--blueprint);
}
.legend th,
.legend td {
  padding: 14px 20px;
  border: 1px solid rgba(15, 39, 66, 0.25);
  background: transparent;
}
.legend th {
  font-size: 0.9rem;
  background: var(--blueprint);
  color: #fff;
}
.legend tr:nth-child(2n) td {
  background: transparent;
}
.legend td:first-child {
  font-weight: 650;
}

.tools-title {
  max-width: 900px;
  margin-top: 72px;
  font-size: 1.4rem;
  text-align: left;
}
.tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
  gap: 0 40px;
  max-width: 900px;
  margin-top: 20px;
  padding: 0;
  list-style: none;
  text-align: left;
  border-top: 2px solid var(--blueprint);
}
.tools li {
  padding: 16px 0;
  border-bottom: 1px solid rgba(15, 39, 66, 0.2);
}
.tools a {
  font-weight: 700;
  color: var(--blueprint);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-brand-1);
  text-underline-offset: 4px;
}
.tools a:focus-visible {
  outline: 3px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.tools span {
  display: block;
  margin-top: 4px;
  color: #4a5361;
}

.author {
  max-width: 46rem;
  margin-top: 64px;
  padding: 28px 0 0;
  border-top: 2px solid var(--line-cyan);
  text-align: center;
}
.author p {
  margin: 0 0 24px;
  font-size: 1.1rem;
  color: #c4d6e4;
}
.author .btn {
  display: inline-block;
}

.quick {
  scroll-margin-top: calc(var(--vp-nav-height) + 52px);
}
.start {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 56px;
  align-items: center;
  margin-top: 72px;
  text-align: left;
}
.start-steps {
  margin: 0;
  padding-left: 1.4rem;
}
.start-steps li + li {
  margin-top: 28px;
}
.start-steps li::marker {
  font-weight: 800;
  color: var(--blueprint);
}
.start-steps pre {
  margin: 10px 0 0;
  padding: 14px 16px;
  border: 2px solid var(--blueprint);
  background: #0a1c31;
  overflow-x: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: #fff;
}
.start-steps p {
  margin: 8px 0 0;
  font-size: 0.92rem;
  color: #4a5361;
}

.faq {
  max-width: 52rem;
  margin-top: 56px;
  text-align: left;
  border-top: 2px solid var(--graphite);
}
.faq details {
  border-bottom: 1px solid rgba(35, 39, 46, 0.15);
}
.faq summary {
  cursor: pointer;
  padding: 22px 0;
  font-size: 1.2rem;
  font-weight: 700;
  font-stretch: 110%;
}
.faq p {
  margin: 0 0 22px;
  color: #4a5361;
}

.final {
  background:
    linear-gradient(rgba(124, 196, 232, 0.07) 1px, transparent 1px) 0 0 / 32px 32px,
    linear-gradient(90deg, rgba(124, 196, 232, 0.07) 1px, transparent 1px) 0 0 / 32px 32px,
    var(--blueprint);
}

.origin {
  padding: 40px 24px 56px;
  background: var(--blueprint);
  border-top: 1px solid rgba(124, 196, 232, 0.25);
}
.origin p {
  max-width: 46rem;
  margin: 0 auto;
  font-size: 0.9rem;
  line-height: 1.6;
  text-align: center;
  color: #9fb6c9;
}

@media (max-width: 960px) {
  .trust,
  .rule-sheet,
  .start {
    grid-template-columns: minmax(0, 1fr);
  }
  .trust-text {
    justify-self: start;
  }
  .callouts {
    border-left: none;
    border-top: 1px solid rgba(124, 196, 232, 0.45);
  }
  .track {
    grid-template-columns: 1fr;
    gap: 0;
    border-left: 2px solid var(--blueprint);
    margin-left: 22px;
  }
  .track li {
    border-top: none;
    padding: 0 0 32px 36px;
  }
  .num {
    position: absolute;
    left: -23px;
    top: 0;
    margin: 0;
  }
}
@media (max-width: 640px) {
  .split {
    grid-template-columns: 1fr;
  }
  .split > div,
  .split > div + div {
    padding: 24px 0 0;
    border-left: none;
  }
  .compare-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .compare-head {
    display: none;
  }
}
</style>
