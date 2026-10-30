# Decision: Frontend Responsibility Boundary

## Status

Validated - implemented in a Vue frontend.

## Scope

This decision defines browser-client responsibilities. It does not require a
particular server, authentication, or deployment choice.

## Context

A frontend application presents information and interactions in the browser,
and may consume capabilities provided by APIs or other external systems. The
frontend needs clear ownership boundaries without prescribing where those
systems run or how authentication and transport are implemented.

## Decision

The frontend owns presentation, user interaction, client-side navigation, and
state needed to support the user experience. APIs and other external
capabilities remain authoritative for persistent data and shared business
rules. The frontend consumes those capabilities through an explicit client
integration boundary. This decision does not prescribe a network-origin policy,
server runtime, authentication protocol, or asset host.

The responsibility boundary is:

```text
Frontend application
        |
        | client integration boundary
        v
API or external capability
```

## Rules

- Frontend features MUST keep presentation and interaction concerns separate
  from authoritative business rules and persistent data ownership.
- Network and external-capability access SHOULD pass through a clear
  client-side boundary so transport handling and response mapping have an
  identifiable owner.
- Browser-delivered code MUST NOT contain server credentials or other secrets
        that are intended to remain private.
- The frontend MUST NOT treat client-side route guards or hidden UI controls as
        authorization for protected data or operations.
- The frontend MAY compose external results for a screen or client-specific
        workflow. Shared business rules and behavior used by multiple consumers
        SHOULD remain with the capability that owns them.
- Client error handling MUST translate integration failures into useful user
        feedback without exposing implementation details.
- The frontend MAY use any documented transport origin and authentication
        arrangement supported by the project; neither is mandated by this decision.

## Rationale

Keeping browser responsibilities distinct from external capabilities prevents
the UI from becoming the accidental owner of shared business behavior, while
leaving transport and deployment choices to each project.

## Alternatives Considered

### Implement shared business rules in the frontend

Rejected as a default because other consumers could then implement the same
rules differently. A frontend may still own presentation-specific behavior.

### Couple UI components directly to transport details

Rejected as a default because it spreads integration handling across the UI and
makes changes to the external contract harder to isolate.

## Consequences

### Positive consequences

- UI and client workflow code have clear responsibilities.
- External business capabilities remain the source of truth for shared rules.
- Client integrations can be tested and changed independently from presentation.

### Negative consequences

- Projects must choose and document the transport and authentication boundaries
  appropriate to their security and deployment requirements.
- Cross-system workflows may require coordination with the owner of an external
  capability.

## Exceptions and Review Triggers

Project-specific integration requirements MAY refine this boundary when they
identify the owning system, client contract, and security responsibilities.
They MUST NOT make the browser the owner of shared business rules by accident.

## Example

An item page asks its client-side data service for a product view, then renders
the returned data and handles loading or failure states. The page does not
reimplement pricing or inventory rules that are shared with other consumers.
