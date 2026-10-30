# Interview Question Bank

Ask a few questions at a time, in the user's language. Skip questions already answered by existing rules or by the project code.

## Evidence (ask for every theme)

- Can you share a **good** code example that shows what we want?
- Can you share a **bad** code example we have seen or want to forbid? What went wrong?
- Which **official documentation** supports this choice?
- Are there **internal documents**, ADRs, incident reports, or reference repositories?
- Which **exceptions** are acceptable, and who decides?
- Is this decision **Accepted** now, or **Proposed** for discussion?

## Architecture

- What kinds of applications does this stack build (API, SPA, CLI, worker, library)?
- What are the layers or modules, and which direction can dependencies go?
- What does the folder structure look like? Can you share a reference tree?
- Where is the composition root or entrypoint, and what may it contain?
- Which responsibilities belong to this application, and which belong elsewhere (other services, client, server)?
- How does the runtime work: processes, threads, background jobs, configuration, environment?
- How do modules communicate (direct calls, events, HTTP, messaging)?
- Which architecture styles are explicitly rejected, and why?

## Code Patterns

- Which concerns need their own theme (e.g. components, services, state, data access, API design, error handling, observability)?
- For each concern: what is the default pattern, and which patterns are forbidden?
- Naming conventions: files, classes, functions, variables.
- How are errors created, propagated, translated, and logged?
- How are inputs validated and outputs shaped?
- How are state, side effects, async, or concurrency handled?
- What are the size or complexity limits for a unit (file, function, component)?
- Which recurring code review comments should become rules?

## Libraries

- For each need (HTTP, validation, ORM, state, logging, dates, testing...), which library is the default?
- Which libraries are forbidden or deprecated, and why?
- Which versions are supported? How are upgrades handled?
- What criteria justify adding a new dependency?
- Which alternatives were evaluated and rejected?
- Should library usage be wrapped behind an internal abstraction, or used directly?

## Testing

- What is the test pyramid: which levels (unit, component, integration, contract, e2e) and in what proportion?
- Which tools and runners are used for each level?
- What must be mocked, and what must never be mocked?
- Where do tests live, and how are they named?
- How is test data created (fixtures, factories, seeded databases, containers)?
- Are there coverage or quality gates in CI? Are they universal or project-specific?
- What makes a test bad (example)?

## Checks

- Which file kinds should be reviewed automatically (glob patterns)?
- For each file kind, which `MUST` / `MUST NOT` statements matter most in review?
- Are there files that match several globs? Which check must win (filename order)?
