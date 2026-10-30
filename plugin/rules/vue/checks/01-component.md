---
title: Component or view. Rules are framework-neutral; Vue APIs are examples.
globs: ["**/*.vue"]
sources:
  - engineering-rules/components-management/README.md
  - architecture/001-client-server-responsibility-boundary.md
---
- A component has one meaningful visual, interaction, or business responsibility and an intentional public interface (props, events, slots). Flag components accumulating unrelated data access, workflows, notifications, modal management, or layout concerns.
- UI (presentational) components MUST NOT contain business workflows, business data access, or domain orchestration.
- Keep loading, selection, and interaction state in the component or its narrowest owner; delegate business and data operations to a service.
- Flag wrappers that only rename or forward an existing design-system component; prefer the project's design system.
- Route guards and hidden controls are not authorization for protected data or operations.
- Browser code MUST NOT contain server credentials or private infrastructure details.
