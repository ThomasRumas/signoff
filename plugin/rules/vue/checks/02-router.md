---
title: Client router.
globs: ["**/router/**/*.{ts,js}"]
sources:
  - architecture/003-spa-routing-and-runtime-integration.md
  - architecture/001-client-server-responsibility-boundary.md
---
- The client router owns SPA navigation; routed pages are declared here and rendered through the application shell's router outlet.
- Route guards improve navigation only; they MUST NOT be treated as authorization for protected data or operations.
- Do not import server implementation details, credentials, or backend infrastructure configuration.
