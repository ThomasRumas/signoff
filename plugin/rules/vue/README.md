---
description: Browser frontend applications. Rules are framework-neutral; Vue examples illustrate them.
detect: ["vue"]
review-marker: vuejs-best-practices
---

# Frontend Best Practices

Use the Engineering Cookbook as the source of truth for frontend decisions.
Its engineering rules describe frontend responsibilities independent of the
chosen UI framework. Code examples use Vue where a concrete example helps; map
the same decision to the corresponding API in React, Svelte, or another
framework. This guide does not prescribe a backend server, authentication
protocol, API origin, or asset-hosting runtime.

## Workflow

1. Identify the framework and project policies relevant to the change. Do not
	infer a required backend runtime from this guide.
2. Load the existing engineering-rule family that owns the behavior. Apply its
	decision regardless of framework; treat Vue APIs in examples as
	illustrations, not requirements.
3. Apply organization-specific requirements only when the project adopts
	them. They are not universal frontend defaults.
4. Treat decision status as meaningful. Do not turn a proposed recommendation
   into a mandatory rule, override an accepted decision, or hide a
   project-specific exception.
5. Verify at the smallest boundary that proves the change: unit, component,
   integration, or end-to-end tests as appropriate to the behavior.

## Generic Frontend Defaults

- Keep rendering, interaction, and browser-owned state in the frontend; keep
  shared business rules and persistent data with their owning capability.
- Create components, shared state, reusable behavior, or services only around
  meaningful responsibilities with clear ownership.
- Keep local state with its narrowest owner; promote it only when independent
  parts of the application need a shared lifecycle.
- Test behavior at the smallest useful boundary. Protect critical user
  journeys with end-to-end tests, which complement rather than replace focused
  unit and component tests.
- Select transport, authentication, build, and test tools according to the
  project. This guide does not mandate a server runtime or a universal CI gate.
- Prefer the project's established design system when it fits the requirement.

When a documented project context requires a different choice, make the
deviation explicit and limit it to the affected boundary.

## Engineering Rule Sets

- [Frontend responsibility boundary](architecture/001-client-server-responsibility-boundary.md)
- [Application structure](architecture/002-frontend-application-structure.md)
- [SPA navigation](architecture/003-spa-routing-and-runtime-integration.md)
- [Components](engineering-rules/components-management/README.md), [reusable behavior](engineering-rules/composable-management/README.md)
- [State and reactivity](engineering-rules/reactivity-management/README.md)
- [Services](engineering-rules/services-management/README.md)
- [Testing strategy](engineering-rules/testing-strategy/README.md); tools and organization-specific thresholds are identified within that family
