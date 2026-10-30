# Decision: SPA Routing and Client-Side Navigation

## Status

Validated - implemented in a Vue frontend.

## Scope

This decision covers browser-side navigation in single-page applications. Its
status records validation of the client-side routing approach in Vue; Vue
Router is the concrete example, not a framework or backend requirement.

## Context

A single-page application needs one owner for browser navigation and a
consistent way to render the page associated with the current URL. Without a
shared router, route matching, access-aware navigation, and page metadata tend
to be duplicated across views.

## Decision

The frontend framework's client-side router owns page navigation. The
application shell renders the active route, and shared route behavior belongs
to router configuration or supporting client modules. API endpoints,
authentication protocols, server routes, and browser asset delivery are
outside this decision and remain project-specific integration concerns. In
Vue, Vue Router is one implementation of this boundary.

## Rules

- A client-side router MUST be the owner of SPA page navigation.
- Routed pages MUST be declared in the router and rendered through the application shell's router outlet.
- Route metadata MAY describe page-level navigation or presentation information consumed by the shell, such as a title or page-header override.
- Protected routes SHOULD use shared client-side navigation behavior rather than implementing access-aware redirects independently in each view.
- A navigation guard MAY redirect to the project's login entry point and preserve the intended client route when the authentication flow supports returning to it.
- Client-side route guards MUST NOT be treated as the security boundary for protected data or server operations.
- Route configuration MUST describe browser navigation only. Server routes, authentication protocols, API forwarding, and SPA asset delivery are outside this decision.

These rules define browser-navigation ownership only. Detailed route naming,
guard implementation, page metadata conventions, testing, and error feedback
belong in the corresponding frontend rules.

## Navigation Flow

When a project requires authenticated navigation, the client-side flow is:

```text
User navigates to a client route
        |
        v
Vue Router beforeEach guard
        |
        v
Shared client authentication state is checked
        |
        +--> authenticated: continue to the route
        |
        `--> unauthenticated: continue through the project's login flow
```

        The login mechanism and return flow depend on the project and are not prescribed
        by this routing decision.

## Rationale

The client-side router provides a single owner for route matching, page
metadata, and shared navigation behavior. Keeping guards at this boundary
prevents each page from implementing its own navigation policy. Backend routing,
authentication, and deployment remain explicit project integration choices.

## Alternatives Considered

### Letting each view handle authentication

Rejected because it duplicates login decisions, creates inconsistent redirects, and makes protected navigation dependent on page implementation details.

### Server-rendering every navigation

Not selected because the starter is a Vue SPA with client-side routing and a shared application shell. Server rendering MAY be reconsidered if SEO, first-render performance, or server-rendered content becomes a product requirement.

## Consequences

### Positive consequences

- Client navigation is centralized and predictable.
- Shared route metadata and navigation behavior have one owner.
- The shell can derive shared page presentation from route metadata and routed context.

### Negative consequences

- Initial protected navigation may need to resolve client authentication state before the route can continue.
- Each environment hosting the SPA must deliver the client entry point for browser routes; its server or hosting configuration is outside this decision.

## Exceptions and Review Triggers

A route MAY be public when it explicitly declares that behavior through the router's metadata and that public access is intentional. A separate navigation mechanism MAY be introduced for a non-SPA surface only when it has an independently owned runtime boundary.

This decision SHOULD be reviewed if the application adopts server-side
rendering, a different client-side router, or multiple independently deployed
frontends with separate navigation boundaries.

## Vue Example

The starter's `src/router/index.ts` declares Vue Router routes and shared
navigation guards. Its `src/main.ts` registers the router during client
bootstrap. Authentication and server integration are configured separately by
the project.
