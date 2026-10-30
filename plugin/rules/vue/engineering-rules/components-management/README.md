# Component Management

These Accepted rules define when a frontend component is a useful boundary.
The decisions apply across frontend frameworks; the examples and file names
use Vue to make them concrete.

## Rules

| Rule | Component responsibility | Status |
| --- | --- | --- |
| [Deciding when to create a component](./001-when-to-create-a-component.md) | Meaningful visual, interaction, or business responsibility | Accepted |
| [Structuring business components](./002-business-component-structure.md) | Business component interfaces and ownership boundaries | Accepted |
| [Separating services, state, and tests](./003-component-services-reactivity-and-testability.md) | Business/data operations, UI state, service focus, and independent testing | Accepted |
| [Creating UI components with a design system](./004-ui-components-and-design-system.md) | Reusable visual components; references shadcn/ui and shadcn-vue for Vue | Accepted |

## Core Principle

Create a component only around a meaningful visual, interaction, or business
responsibility with a clear interface. Business components own cohesive user-
facing capabilities; services own framework-independent operations; the
framework's component model owns rendering and local interaction state. Vue is
used in examples, not required by the decision.

These rules complement the [Vue application structure](../../architecture/002-frontend-application-structure.md). Detailed rules for state management, service boundaries, routing, and testing belong in their respective rule sets.
