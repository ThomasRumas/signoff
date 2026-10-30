---
title: Frontend service (business and data operations).
globs: ["{**/*.service.{ts,js},**/services/**/*.{ts,js}}"]
sources:
  - engineering-rules/services-management/README.md
  - architecture/001-client-server-responsibility-boundary.md
---
- Services MUST be independent of framework-owned UI state, component lifecycle, DOM, and presentation decisions; flag reactive refs, loading flags, or lifecycle hooks in a service. Accept explicit inputs and return data or meaningful errors.
- Use typed models for meaningful operations and map between API and frontend models instead of leaking persistence-shaped data.
- Use the project's client integration boundary. Browser code MUST NOT contain server credentials or private infrastructure details.
- Do not duplicate shared business rules or aggregation owned by the business API.
- Organize by business domain; flag generic `common`, `utility`, `helper`, `data`, or `api` services collecting unrelated operations.
