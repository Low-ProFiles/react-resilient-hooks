# v0.2.0 Plan

This document outlines the plan for the v0.2.0 release of react-resilient-hooks.

## Goals

- Refactor the repository into modular packages.
- Introduce a policy-based architecture for more flexible and extensible hooks.
- Improve observability and debugging capabilities.
- Enhance the documentation and landing page.

## Package Structure

The repository will be restructured into the following packages:

- `@resilient/core`: The core package with no React dependency. It will contain the policies, stores, and domain logic.
- `@resilient/utils`: A package that depends on `@resilient/core` and React. It will provide the React hooks.
- `landing`: The Next.js documentation and demo website.

## Commit Sequence

The release will be developed through a series of feature branches, each with a specific focus.

1.  **feature/split-packages**: Split the existing codebase into the new package structure.
2.  **feature/policies-stores**: Introduce policy and store interfaces and implementations.
3.  **feature/observability**: Add an event bus and logger for better observability.
4.  **feature/sw-protocol**: Define a versioned service worker message schema and a flush protocol.
5.  **feature/docs-landing**: Improve the documentation and landing page.
6.  **feature/quality-gates**: Add unit tests, linting, and CI pipelines.

## Release Process

1.  Merge all feature branches into the `develop` branch.
2.  Build and test all packages.
3.  Create a release commit and tag.
4.  Push the release to the `main` branch.
