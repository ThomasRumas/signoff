# Rule: Deduplicate Concurrent Shared-Store Loads

## Status

Accepted

## Scope

This rule applies to shared-store operations that lazily load shared data. The
code example uses Vue and Pinia.

## Context

A loaded-value guard prevents repeated requests after success, but it does not prevent two consumers from starting the same request before the first one completes. Shared stores should coordinate both cases.

## Decision

A default load operation for shared data SHOULD:

1. Return immediately when the data is already loaded.
2. Return the existing in-flight promise when a request is already running.
3. Clear the in-flight promise when the request settles.
4. Leave the data unloaded after failure so a later call can retry.

A deliberate refresh action is a separate operation and MAY bypass the loaded-value guard according to its documented invalidation policy.

## Rules

- A store MUST NOT issue duplicate default-load requests for an already loaded value.
- A store MUST coordinate concurrent default-load calls when multiple consumers can request the same state.
- Failed default loads MUST remain retryable unless the store has an explicit terminal-error policy.
- The in-flight promise MUST be cleared in `finally`, including after failure.
- `isLoading` MUST represent the shared request lifecycle rather than one caller's local lifecycle.
- A deduplication guard MUST NOT prevent an explicitly requested refresh from running when refresh is part of the store contract.

## Vue/Pinia Example

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOrders } from '@/services/orders'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[] | null>(null)
  const isLoading = ref(false)
  let fetchPromise: Promise<void> | null = null

  async function fetchOrders() {
    if (orders.value !== null) return
    if (fetchPromise !== null) return fetchPromise

    fetchPromise = (async () => {
      isLoading.value = true

      try {
        orders.value = await getOrders()
      } finally {
        isLoading.value = false
        fetchPromise = null
      }
    })()

    return fetchPromise
  }

  return { orders, isLoading, fetchOrders }
})
```

The sequence is:

```text
First consumer calls fetchOrders()
      |
      v
One API request starts and fetchPromise is stored
      |
      +--> second consumer calls fetchOrders()
      |       `--> receives the same promise; no second request
      |
      v
Request succeeds
      |
      v
orders is populated and fetchPromise is cleared
      |
      `--> later fetchOrders() returns without a request
```

If the request fails, the promise is still cleared and `orders` remains `null`, so the next call can retry.

## Rationale

A shared store is a coordination point. Reusing an in-flight operation avoids
duplicate requests and inconsistent loading behavior without introducing a
general-purpose caching library or an implicit expiry policy.

## Consequences

- Concurrent consumers share one request.
- Successful data is not fetched again by the default load action.
- Failure remains recoverable through a later call.
- Refresh and invalidation need separate, explicit actions when required.

## Exceptions

A request MAY be repeated when it is an explicit refresh, the previous data is intentionally invalidated, or the upstream contract requires polling. The action name and behavior SHOULD make that distinction clear.
