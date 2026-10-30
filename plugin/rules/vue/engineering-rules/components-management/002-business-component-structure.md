# Rule: Structure Business Components

## Status

Accepted

## Scope

This rule applies to frontend components that represent a meaningful business
capability or concept. Vue file names and code below are implementation
examples, not required framework structure.

## Context

Business components need to render a workflow, own interaction state, and use
business/data operations without becoming containers for generic utilities or
transport implementation details. Separating these responsibilities makes the
workflow easier to understand and allows non-visual operations to be tested
independently.

## Decision

A business component MAY be organized as a focused component directory when
the capability has a distinct data contract or business operations. One Vue
example is:

```text
my-component/
  my-component.vue
  my-component.dto.ts
  my-component.service.ts
```

The files are complementary, not mandatory ceremony. Do not create an empty DTO or service file. Add each file only when the component has that responsibility.

## Rules

- The component implementation MUST render the workflow, own component-local UI state, handle user interactions, manage relevant framework lifecycle concerns, and orchestrate the business operations it needs.
- The component MUST NOT become a container for generic business utilities, unrelated data transformations, or low-level API implementation details.
- A component-specific contract file SHOULD contain request/response models that make the business component's data contract explicit when such a contract exists.
- DTOs MUST describe the component's contract rather than expose persistence models or unrelated service internals.
- A component service SHOULD contain business/data operations directly related to the component's responsibility. It MAY contain business methods, mapping, transformation, validation, client calls, and business-purpose formatting.
- A business component service MUST remain focused on its component responsibility. Generic array helpers, unrelated date formatting, notifications, modal management, and unrelated API operations belong elsewhere.
- The component MUST expose an intentional interface through typed props, emits, slots, or another explicit public API.
- The component SHOULD coordinate its service and state rather than duplicate the same business workflow in its template or parent views.
- If a capability is used by multiple components but no longer belongs to one component's responsibility, move it to the appropriate shared service or application abstraction instead of extending one component's service indefinitely.
- A business component MUST NOT be created merely to wrap a visually grouped block of markup. Apply [the component creation rule](./001-when-to-create-a-component.md) first.

## Responsibility Map

| Concern | Owner |
| --- | --- |
| Rendering | UI/business component |
| Framework state and lifecycle | Component or reusable behavior module |
| Component-local loading, selection, and interaction state | Component |
| Business rules independent of UI state | Business service |
| Data mapping and business transformations | Business service |
| API calls required by the capability | Focused business/client service, using the application API boundary |
| Component request and response contracts | Component DTOs or shared contract types when genuinely shared |
| Cross-component application state | Appropriate application or feature store |

## Vue Example

```ts
// my-component.service.ts
export async function loadCustomer(id: string): Promise<CustomerDto> {
  const response = await apiFetch<CustomerApiResponse>(`/customers/${id}`)
  return mapCustomerResponse(response)
}

export function mapCustomerResponse(data: CustomerApiResponse): CustomerDto {
  return {
    id: data.id,
    name: `${data.firstName} ${data.lastName}`,
  }
}
```

```vue
<script setup lang="ts">
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
</script>
```

The service operates on data and returns data. The component owns UI state and
decides how the workflow is rendered. Other frameworks use their equivalent
component and state APIs.

## Rationale

This structure makes the business contract visible, prevents UI concerns from
leaking into services, and keeps a business workflow cohesive without turning
its component into a god component.

## Consequences

- Business workflows have explicit boundaries and names.
- Services and contract mapping can be tested without rendering a component.
- A capability may require several files when its responsibilities are substantial.
- Small components should avoid creating files that have no independent responsibility.
- Shared business operations require deliberate ownership when they serve several components.

## Exceptions

A simple business component MAY keep a small operation in its component file when extracting a service would add indirection and the operation is clearly local. The exception MUST preserve the separation between UI state and business/data concerns as the component grows.
