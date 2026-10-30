# Frontend CI and Deployment

Frontend build, CI, and deployment tools are selected by each project. This
index does not require a particular CI provider, build tool, container
platform, or hosting runtime.

## Related Rules

- [Testing strategy](../testing-strategy/README.md) defines the test boundaries.
- [E2E CI and pull-request protection](../testing-strategy/010-e2e-ci-and-pr-protection.md)
  describes an optional every-PR E2E gate when a project adopts that policy.

## Project Checklist

- [ ] CI runs the project's selected unit and component test suites.
- [ ] Critical user journeys use the project's selected end-to-end runner when
      E2E coverage is part of the project policy.
- [ ] E2E environments, readiness, test data, secrets, and artifacts are
      configured for repeatable and secure runs.
- [ ] Build and deployment steps follow the selected framework and hosting
      platform rather than assumptions from another runtime.
