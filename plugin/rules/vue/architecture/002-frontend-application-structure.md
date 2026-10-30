# Decision: Frontend Application Structure

## Status

Validated - implemented in a Vue frontend.

## Scope

This rule describes a responsibility-oriented structure for frontend
applications across frameworks. The Vue folder names below illustrate the
decision and are not required names for other frameworks.

## Context

A frontend application needs a structure that separates its entry point,
shared shell, pages, reusable UI, reusable behavior, shared state, external
integrations, and styles. Without an explicit structure, responsibilities
tend to collect in page components or become spread across unrelated folders.

The Vue example uses a small, source-oriented structure under `src`.
Its layout illustrates the responsibilities described by this decision; it is
not a mandatory folder template.

## Decision

Organize the client around application responsibility. One Vue example is:

```text
src/
  main.ts              Application bootstrap
  App.vue              Application shell and shared layout
  router/              Client-side route definitions and navigation hooks
  views/               Routed page-level compositions
  components/          Reusable client components, including UI and business capabilities
  composables/         Reusable stateful or behavioral logic
  stores/              Application and feature state
  services/            API-facing operations and transport types
  styles/              Global styles and design-system integration
```

The structure is responsibility-oriented rather than a mirror of the backend
module tree. Frontend folders do not imply that the browser owns backend
authentication, business rules, or upstream service orchestration.

## Rules

- The client entry point MUST compose the framework application, register required navigation and state facilities, load global styles, and mount or render the frontend.
- The application shell MUST own shared layout and persistent presentation concerns.
- Route-level pages MUST own page composition and coordinate the components, state, behavior, and services required by that route.
- Reusable components MUST own focused visual, interaction, or business-component responsibilities. Existing design-system components SHOULD be preferred when they meet the requirement.
- Reusable behavior modules MUST own framework-aware state or lifecycle behavior that is not itself a page or visual component. Vue calls these composables; other frameworks may use hooks or equivalent abstractions.
- A shared state store MUST contain state that independent parts of the application need to coordinate across component boundaries.
- Services MUST contain client-facing integration operations, data transformations, and their contract types. They MUST respect the [frontend responsibility boundary](./001-client-server-responsibility-boundary.md).
- Global style entry points and design-system integration MUST remain separate from page-specific business behavior.
- Client modules MUST depend toward the browser application boundary. They MUST NOT import server implementation details, credentials, or backend infrastructure configuration.
- The application shell MAY consume navigation state, shared stores, or reusable behavior needed to render persistent layout. Route-specific behavior SHOULD remain with its page or supporting client modules.
- New client capabilities SHOULD be placed in the narrowest existing responsibility that owns them. A new folder or abstraction requires a distinct architectural responsibility.

These rules describe ownership and dependency direction only. Detailed rules
for stores, reusable behavior, component APIs, service error handling, testing,
and styling belong in their focused frontend rule sets, including the
[reusable behavior rules](../engineering-rules/composable-management/README.md).

## Vue Example: Dependency Direction

In this example, dependencies flow from the application composition toward reusable client capabilities:

```text
main.ts
  |
  v
App.vue ---> router/ ---> views/
  |                         |
  +--> stores/  <------------+
  +--> composables/ <---------+
  +--> components/ <----------+
  +--> styles/

views/components/composables/stores
  |
  v
services/ ---> project-configured API client
```

This is a responsibility guide, not a prohibition on every individual import. For example, the router may use an authentication store for navigation decisions, and the application shell may use a composable to coordinate shared page-header state.

## Rationale

The structure is small enough for a starter and explicit enough to support growth. It keeps routed pages distinct from reusable UI, allows behavior to be reused without forcing it into components, and gives external integrations a visible boundary. It also avoids adding a frontend module framework solely to mirror a backend module layout.

## Alternatives Considered

### One folder per route with all code co-located

Not selected as the default because the starter has shared shell, navigation, authentication, and API concerns that span multiple routes. Co-location MAY be introduced for a genuinely isolated feature if it preserves the same ownership boundaries.

### Mirroring backend modules in the client

Not selected because the client and server have different responsibilities. A frontend folder structure that mirrors backend modules can suggest that browser code owns server concerns such as authentication, persistence, or business orchestration.

### A larger layered frontend architecture

Not selected because the current application does not need additional domain, application, or infrastructure layers. Such layers would add indirection before the client has a problem that requires them.

## Consequences

### Positive consequences

- Contributors can locate code by responsibility.
- The application shell remains separate from routed page composition.
- Reusable behavior, UI, and business capabilities have distinct homes.
- External-capability access is visibly constrained to client services and their documented integration boundary.
- The structure can grow without requiring a framework-specific module system.

### Negative consequences

- A feature may touch several responsibility folders when it spans UI, state, behavior, and API access.
- The boundaries require judgment; folder names alone do not prevent misplaced logic.
- Feature-local co-location is less direct when a capability is truly isolated.

## Exceptions and Review Triggers

A project MAY introduce feature-oriented subfolders or co-location when a feature has clear ownership, limited cross-feature reuse, and documented dependency direction. The exception SHOULD be reviewed if the same capability becomes shared or if the project develops many parallel feature structures.

The structure SHOULD be reviewed if the client becomes a substantially larger product, adopts multiple independent domains, or needs a different deployment/runtime boundary.

## Vue Example

In the starter:

- `src/main.ts` composes Vue, Pinia, the router, and global styles.
- `src/App.vue` provides shared navigation and page framing around `RouterView`.
- `src/views/` contains routed pages such as `HelloWorld.vue` and `UserView.vue`.
- `src/stores/auth.ts` owns reactive authentication state.
- `src/services/api.ts` provides the project's API transport wrapper.
- `src/composables/usePageHeader.ts` provides reusable page-header coordination.
