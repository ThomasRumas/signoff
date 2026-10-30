# Services Management

These rules define service ownership and composition for frontend applications
regardless of framework. Vue code may appear in examples; it illustrates the
decision rather than limiting its scope.

## Status

Accepted

## Rules

| Rule | Scope |
| --- | --- |
| [Create services around meaningful responsibilities](./001-when-to-create-a-service.md) | Service creation, ownership, and avoiding premature abstractions |
| [Keep services independent from UI concerns](./002-service-and-ui-boundaries.md) | State, lifecycle, and presentation separation |
| [Use services for API contracts and workflows](./003-service-api-coordination.md) | Framework-neutral client/API coordination principles |
| [Compose services around business domains](./004-service-composition-and-organization.md) | Framework-neutral service composition and ownership |
| [Separate services, business components, and stores](./005-service-component-and-store-boundaries.md) | Choosing the correct owner for reusable logic and state |
| [Keep services independently testable](./006-service-testability-and-maintenance.md) | Testability and maintenance rules |

## Core Principle

A service is the boundary for reusable business or application logic that
exists independently from the UI. It may coordinate the frontend with an API,
transform data, and implement client-owned workflows, while remaining
independent from framework reactivity and component lifecycle.

These rules complement the [component management rules](../components-management/README.md), the [state ownership rules](../reactivity-management/README.md), and the [frontend application structure](../../architecture/002-frontend-application-structure.md).
