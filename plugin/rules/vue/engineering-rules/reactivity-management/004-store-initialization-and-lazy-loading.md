# Rule: Initialize Shared Stores Without Fetching Data

## Status

Accepted

## Scope

This rule applies to shared stores that own API-backed or otherwise loadable
state. The code example uses Vue and Pinia.

## Context

Creating a store during application bootstrap does not mean that every resource owned by the store is needed immediately. Fetching all data at startup creates hidden network requests, delays startup, consumes memory, and loads data that the user may never visit.

## Decision

A store MUST initialize its state with defaults only. The view or component
that requires the data is responsible for triggering the load. Store creation
and data loading are separate lifecycle events.

## Rules

- Store setup MUST NOT automatically fetch application data as a side effect of store creation.
- Data MUST be loaded when a view or component actually requires it, unless an explicitly documented prefetch is needed for navigation or performance.
- A nullable resource SHOULD use `null` for "not loaded" when the distinction matters.
- A collection SHOULD use `null` for "not loaded" and `[]` for "loaded successfully with no items" when the UI needs to distinguish those states.
- A store action SHOULD expose the loading operation rather than hiding it in module evaluation or application bootstrap.
- Lazy loading MUST preserve the store's defined loading, success, empty, and failure states.

## Vue/Pinia Example

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOrders } from '@/services/orders'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[] | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function fetchOrders() {
    if (orders.value !== null) return

    isLoading.value = true
    errorMessage.value = null

    try {
      orders.value = await getOrders()
    } catch (error) {
      errorMessage.value = 'Unable to load orders.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return { orders, isLoading, errorMessage, fetchOrders }
})
```

The store starts with `orders === null`. A consuming view calls `fetchOrders()` when the orders screen is entered. After a successful empty response, `orders` is `[]`, which is different from not having loaded the data.

## Lifecycle Tree

```text
Application starts
      |
      v
Create store with default state
      |
      +--> orders = null
      +--> isLoading = false
      `--> no API request

User enters a view that needs orders
      |
      v
View calls fetchOrders()
      |
      v
Store loads the data when needed
      |
      +--> success with items: orders = [ ... ]
      +--> success with no items: orders = []
      `--> failure: orders remains null and error is exposed
```

## Rationale

Lazy loading makes network activity intentional and aligns data lifetime with user needs. Explicit loaded-state semantics prevent an empty result from being confused with a request that has not happened.

## Consequences

- Application startup remains free of unrelated resource fetches.
- Consumers must trigger the load at the correct time.
- Stores need explicit error and retry behavior.
- A cached result may remain available longer than one view; invalidation is a separate policy decision.

## Exceptions

A store MAY prefetch data when navigation, latency, or an explicitly measured
user workflow requires it. The prefetch trigger and cost MUST be documented,
and store creation MUST remain free of accidental network side effects.

Use [the fetch deduplication rule](./005-store-fetch-deduplication.md) when multiple consumers can request the same loadable state.
