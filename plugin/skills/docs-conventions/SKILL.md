---
name: docs-conventions
description: 'Shared conventions for project technical documentation: docs/ folder layout, when to use a Mermaid diagram in Markdown versus an Archify diagram, how to link Archify artifacts, the baseline set of documents a project needs, and maintenance rules. Use when: writing or updating technical documentation, ADRs, C4, sequence, class, UML or ERD diagrams, or auditing documentation. Load before any docs-* skill.'
---

# Documentation Conventions

Documentation exists to explain why the system is built this way, how its parts are organized and communicate, how data is structured, and what a change can affect. Do not document every line of code.

## Quality Criteria

Every document must be:

- **Understandable** without asking its authors.
- **Relevant**: it answers a concrete question for an identified reader. A few clear documents beat an exhaustive set.
- **Up to date**: it reflects the real system. An outdated document is worse than none.
- **Centralized**: versioned next to the code, linked from `docs/README.md`.
- **Adapted to its reader**: global view for leads, detailed sequences for developers changing a flow, tables and constraints for schema changes.

## Layout

If the project already has a documentation layout, follow it. Otherwise use:

```text
docs/
  README.md            # index: one line per document, grouped by kind
  architecture/        # C4 context, containers, components; deployment
  adr/
    README.md          # ADR index with status
    NNN-<slug>.md      # one decision per file
  data/                # ERD per functional domain
  flows/               # sequence and activity diagrams per scenario
  design/              # class, state, component diagrams
```

File names are kebab-case. One document answers one question.

## Mermaid or Archify

Default to a **Mermaid diagram inside Markdown**, surrounded by text that explains purpose, scope, and reading notes. Use **Archify** (load the `archify` skill) only when at least one applies:

- More than about 12 elements, or edges too dense to read in Mermaid.
- Several trust, network, or ownership boundaries, or several external systems.
- A critical or complex feature, or the main architecture view of a large project.
- The diagram is shared outside the team or used in reviews and onboarding.
- The user explicitly asks for Archify.

Never produce a diagram when a short paragraph or list answers the question. State your choice and the reason before producing it.

### Linking Archify

Archify writes to `.archify/<type>-<slug>-<timestamp>/` (`candidate.json` source, `<slug>.html` output). The Markdown document stays the entry point:

```markdown
## Containers

<Explanation of the view.>

Interactive diagram: [containers](../../.archify/architecture-containers-20261028-101500/containers.html)
(source: `candidate.json` in the same folder).
```

`.archify/` may be git-ignored. Check with `git check-ignore -v .archify`. If it is ignored, tell the user the link will not be shared and offer to keep a Mermaid summary in the Markdown as well.

## Baseline

Start small and grow with the system's complexity and risks.

| Document | Purpose | Main content | Skill |
| --- | --- | --- | --- |
| Context diagram | Environment of the system | Users, system, external dependencies | `docs-c4` |
| Container diagram | Overall architecture | Applications, services, stores, communications | `docs-c4` |
| Component diagram | Internal breakdown | Modules, responsibilities, dependencies | `docs-c4` |
| Database diagram | Data structure | Tables, keys, relations, cardinalities | `docs-erd` |
| Sequence diagrams | Critical scenarios | Participants, calls, order of interactions | `docs-sequence` |
| Class diagrams | Object model | Classes, attributes, operations, relations | `docs-class` |
| Other UML views | Workflows, states, deployment | Activities, states, nodes | `docs-uml` |
| ADR | Structuring decisions | Context, options, decision, consequences | `docs-adr` |

## Maintenance Rules

- Store documentation in the repository, versioned with the code.
- State the scope and purpose at the top of each document.
- Update affected diagrams with any significant change.
- Write an ADR for decisions that durably change the architecture.
- Supersede decisions instead of editing accepted ADRs silently.
- Ground every element in the code, schema, configuration, or user input. Never invent components, tables, or calls.
- Mark uncertain elements explicitly (`TODO: confirm`) instead of guessing.

## References

- [C4 model: introduction](https://c4model.com/introduction)
- [C4 model: diagrams](https://c4model.com/diagrams.html)
- [Microsoft: Architecture decision record](https://learn.microsoft.com/fr-fr/azure/well-architected/architect-role/architecture-decision-record)
- [OMG: What is UML?](https://www.omg.org/gettingstarted/what_is_uml.htm)
