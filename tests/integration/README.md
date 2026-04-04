# Integration Test Catalog

This folder is the source of truth for integration cases that can later be automated with Playwright.

## Conventions

- Every case is written in `Given / When / Then`
- Each case includes minimal `Data` and observable `Checks`
- Cases are grouped by user flow so they can be implemented independently

## Suggested layout

```text
tests/
  integration/
    cases/
      auth.md
      home.md
      reader.md
      creator.md
      admin.md
      responsive.md
```

## Relationship to OpenSpec

The OpenSpec change `add-integration-tests-gwt` defines the scope and acceptance criteria for this catalog.

