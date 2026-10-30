# Rule: Separate Component Services, Reactivity, and Tests

## Status

Accepted

## Scope

This rule applies to component-owned services and frontend component logic
regardless of framework. Vue APIs in examples are illustrative.

## Context

Business/data operations and UI state have different lifecycles and testing
needs. Putting framework state or lifecycle hooks in a service couples it to a
rendered component and makes reuse and independent testing harder.

## Decision

Use this boundary:

> If an operation is about business/data behavior, it MAY belong in a focused
> service. If it is about rendering, UI state, or framework lifecycle, it
> belongs in the component or an appropriate reusable behavior module.

Services operate on inputs and return data or errors. Components own UI state
and orchestrate how service results affect presentation.

## Rules

- A component service MUST NOT create or mutate framework state owned by a component. In Vue, this includes `ref`, `reactive`, and `computed` values.
- A component service MUST NOT depend on component lifecycle hooks, template state, mounted instances, or UI interaction state.
- A service SHOULD accept explicit inputs and return data, transformed data, or a meaningful error.
- Business validation, mapping, conversion, calculations, and API operations MAY belong in a service when they are independent of UI state and directly support the business responsibility.
- Loading, selected values, open/closed state, optimistic UI state, and other interaction state MUST remain in the component, its focused reactive behavior module, or an appropriate store.
- Notification rendering, modal visibility, button state, and other presentation decisions MUST remain outside the service unless the application has an explicitly defined UI orchestration abstraction.
- Services MUST use the project's documented client integration contract. They MUST NOT expose credentials or private infrastructure details to browser code.
- A service MUST remain focused. Do not create a generic service containing unrelated business operations merely because several methods are technically reusable.
- When an operation becomes shared across several business components, move it to an abstraction whose ownership matches the shared responsibility rather than keeping it in the first component's service.

## Vue Example

```ts
// customer.service.ts
export async function loadCustomer(id: string): Promise<CustomerDto> {
  const response = await apiFetch<CustomerApiResponse>(`/customers/${id}`)
  return mapCustomerResponse(response)
}
```

```ts
// customer-component.vue
const customer = ref<CustomerDto | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    customer.value = await loadCustomer(customerId)
  } finally {
    loading.value = false
  }
}
```

The service knows how to retrieve and transform customer data. The component
owns UI state and the loading lifecycle. Other frameworks use their equivalent
component and state APIs.

## Bad Example

```ts
// customer.service.ts
const loading = ref(false)
const customer = ref(null)

export async function load() {
  loading.value = true
  customer.value = await fetchCustomer()
  loading.value = false
}
```

This service is coupled to Vue reactivity and hides component state inside a
module that cannot be cleanly scoped to a component instance.

## Testability

- Business components MUST have isolated service tests and focused UI component tests.
- Component-service tests SHOULD cover business rules, data transformations, contract mapping, API behavior, error handling, and business-specific calculations without rendering a component.
- Business-component tests SHOULD cover rendering, user interactions, state changes, lifecycle behavior, service invocation, and handling of service results or errors.
- UI components do not require project-level unit-test suites by default. Custom UI behavior may justify a narrow focused test.
- A test boundary MUST follow the responsibility boundary. Do not test a service's business mapping only through rendered markup when it can be tested directly.
- A service SHOULD expose deterministic functions where practical so business behavior can be tested with explicit inputs and outputs.

The detailed boundaries are defined by the [business-component testing rule](../testing-strategy/003-unit-testing-business-components.md) and the [UI-component testing rule](../testing-strategy/004-ui-components-and-unit-testing.md).

## Rationale

The separation keeps services reusable and independently testable while allowing components to remain natural Vue components. It also prevents "separation" from becoming a reason to move UI state into files that cannot own it correctly.

## Consequences

- Components explicitly own loading and interaction state.
- Services are easier to reuse and test without Vue mounting.
- Some workflows require coordination between a component and its service.
- Shared state still needs an appropriate store or composable; extracting a service alone does not solve state ownership.
