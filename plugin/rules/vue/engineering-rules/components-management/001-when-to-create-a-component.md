# Rule: Decide When to Create a Component

## Status

Accepted

## Scope

This rule applies when deciding whether a frontend component is justified.
The criteria apply across frameworks; Vue terminology in examples is
illustrative.

## Context

Creating a component or splitting code across files does not automatically improve the design. Components that exist only for a small block of markup, one-off local behavior, or speculative reuse add indirection without creating a useful boundary. Conversely, a meaningful business capability can become difficult to maintain when it is kept inside a large view or mixed with unrelated UI concerns.

## Decision

A new component MUST be created only when it represents a meaningful visual,
interaction, or business responsibility. The responsibility MUST be clear
enough to define the component's public interface and ownership of its state
or behavior. In Vue, this boundary is implemented as a Vue component.

Classify the component before creating it:

| Type | Purpose | Default location |
| --- | --- | --- |
| Business component | An autonomous, reusable business capability or business concept | `src/components/` or a clearly owned feature area |
| UI component | A reusable visual or interaction pattern | `src/components/` |
| View | A route-level page composition | `src/views/` |
| Local implementation | One-off markup or behavior with no meaningful independent boundary | Existing view or parent component |

## Rules

- A business component MUST represent a coherent business responsibility, such as a customer address form, order summary, payment method selector, product configuration, or permissions editor.
- A business component SHOULD be autonomous enough to manage its own business workflow and SHOULD expose a clear interface through props, emits, slots, or another explicit API.
- A business component SHOULD be reusable when the same business capability is needed in multiple places. A route-specific composition that is not reusable SHOULD remain in its view unless it has a strong independent responsibility.
- A UI component MUST primarily provide visual composition or UI interaction and MUST remain independent from unrelated business workflows.
- A view MUST remain the owner of route-level page composition. A view SHOULD delegate a meaningful repeated capability to a component rather than becoming a god component.
- A new component MUST NOT be created only because markup is visually grouped, a file is becoming slightly long, or reuse might be needed someday.
- Logic that is specific to one view, too small to be autonomous, non-reusable, or purely local UI behavior SHOULD remain local.
- A component MUST have a focused responsibility. Unrelated data access, business workflows, notifications, modal management, and layout concerns MUST NOT be accumulated in one component.
- The component's public interface MUST be intentional. Do not expose internal state or implementation details when props, emits, slots, or a narrower operation are sufficient.
- The proposed component SHOULD be reviewed against the existing design-system components before being classified as a custom UI component. See [the UI component rule](./004-ui-components-and-design-system.md).

## Decision Questions

Before creating a component, answer these questions:

1. What meaningful responsibility does it own?
2. Is the responsibility visual, route-level, behavioral, or business-oriented?
3. Who will reuse it, or why must it be autonomous if it is currently used once?
4. What is its public interface?
5. Which state, behavior, and data does it own, and which does its parent own?
6. Can the responsibility remain local without making the parent difficult to understand?
7. Does the design system already provide the required UI?

If the answers do not identify a meaningful independent responsibility, keep the implementation local.

## Examples

### Create a business component

`CustomerAddressForm` is a business component when it encapsulates the address workflow, exposes a clear form interface, and is useful in more than one customer-facing context. Its structure follows [the business component rule](./002-business-component-structure.md).

### Create a UI component

A repeated `CustomerSearchForm` composition can be a UI component when it consistently combines design-system inputs, a select, a button, and an alert across multiple views. It must remain focused on UI composition unless it acquires an autonomous business responsibility.

### Keep the implementation local

A single view's expanded/collapsed section or one-off loading indicator should remain in that view when no other consumer needs it and no independent responsibility is created.

## Rationale

This decision creates boundaries around responsibilities rather than maximizing the number of files. It keeps simple code simple, gives meaningful business capabilities an explicit home, and reduces the likelihood of large components that own unrelated concerns.

## Consequences

- Component boundaries become easier to explain and review.
- Small local behavior avoids unnecessary indirection.
- Reusable business capabilities can be tested and evolved independently.
- Some decisions require judgment because reuse and responsibility cannot be determined mechanically.
- A component may touch supporting stores, composables, and services when its responsibility genuinely spans them.

## Exceptions

A component MAY be introduced before a second consumer exists when its responsibility is already autonomous, its interface is clear, and keeping it local would obscure the parent or duplicate a substantial workflow. The reason SHOULD be documented in the change description.
