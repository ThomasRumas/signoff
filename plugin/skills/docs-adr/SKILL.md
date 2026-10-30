---
name: docs-adr
description: 'Write and maintain Architecture Decision Records (ADR) in docs/adr/ using the team template: context, decision, rules, rationale, alternatives, consequences, status lifecycle and superseding. Use when: recording an architecture decision, documenting why a technology or pattern was chosen, replacing or deprecating a decision, maintaining the ADR index.'
---

# Architecture Decision Records

Load `docs-conventions` first. ADRs live in `docs/adr/NNN-<slug>.md`, indexed by `docs/adr/README.md`. Use the [template](./references/template.md).

An ADR records **one significant decision** and **why** it was taken: context, constraints, options, the decision, and its trade-offs. The code shows the result; the ADR keeps the reasoning.

## When to Write One

Write an ADR when a decision durably affects structure, dependencies, data, interfaces, security, or operations, and is costly to reverse. Do not write one for local implementation choices.

## Workflow

1. **Check existing ADRs** in `docs/adr/` (and any `adr`, `decisions` folder). If one covers the topic, decide with the user whether to supersede it.
2. **Interview** the user, a few questions at a time:
   - What problem forces a decision now? What constraints apply (cost, security, performance, skills, compatibility, deadlines)?
   - Which options were considered? Pros and cons of each?
   - What is decided, and what concrete rules follow from it?
   - What gets better, what gets worse, what must be watched?
   - Accepted exceptions? Who decided, and when?
   - Supporting links or documents?
3. **Number** with the next free three-digit number. Slug is the decision in kebab-case.
4. **Draft** from the template, show it, adjust, then write.
5. **Update the index** `docs/adr/README.md` (create it if missing).

## Status Lifecycle

`Proposed` → `Accepted` → `Deprecated` or `Superseded by [NNN](./NNN-slug.md)`. A `Rejected` status keeps the record of a refused proposal.

- Never rewrite the decision of an `Accepted` ADR. Create a new ADR and change only the old one's status line to `Superseded by ...`.
- Typos and broken links may be fixed in place.

## Index Template

```markdown
# Architecture Decision Records

| # | Decision | Status | Date |
| --- | --- | --- | --- |
| [001](./001-<slug>.md) | <Title> | Accepted | <YYYY-MM-DD> |
```

## Quality Checklist

- One decision per ADR; title states the decision, not the problem.
- Context is understandable by someone joining years later.
- At least one real alternative with the reason it was rejected.
- Consequences list both benefits and costs.
- Rules use MUST / SHOULD / MAY and are verifiable.
- Short: aim for one or two screens.

## References

- [Microsoft: Architecture decision record](https://learn.microsoft.com/fr-fr/azure/well-architected/architect-role/architecture-decision-record)
- [Google Cloud: Architecture decision records](https://docs.cloud.google.com/architecture/architecture-decision-records?hl=fr)
- [Martin Fowler: Architecture Decision Record](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html)
