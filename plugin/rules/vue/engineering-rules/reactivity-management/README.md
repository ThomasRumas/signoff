# State and Reactivity Management

These Accepted rules define how frontend state is owned, shared, initialized,
and synchronized. The decisions apply across frameworks; Vue reactivity and
Pinia are used as concrete examples, not as required tools.

## Status

Accepted

## Rules

| Rule | Scope |
| --- | --- |
| [Keep UI state local by default](./001-local-vue-reactivity.md) | Local state ownership; Vue APIs shown as examples |
| [Assign state to the lowest responsible owner](./002-state-ownership-and-escalation.md) | State ownership hierarchy and escalation criteria |
| [Use a store for genuinely shared state](./003-when-to-use-a-pinia-store.md) | When independent consumers need one shared state lifecycle |
| [Load store data lazily](./004-store-initialization-and-lazy-loading.md) | Store initialization, loading triggers, and loaded-state semantics |
| [Deduplicate shared store fetches](./005-store-fetch-deduplication.md) | Cached results, concurrent requests, and retries |
| [Separate stores from services](./006-store-service-responsibilities.md) | Reactive state lifecycle versus business/data operations |

## Core Principle

Keep UI state with its narrowest responsible owner. Promote it to a shared
store only when independent parts of the application need the same state or
lifecycle. Load shared data when required and let its owner coordinate loading.

These rules complement the [component management rules](../components-management/README.md) and the [front-end application structure](../../architecture/002-frontend-application-structure.md).
