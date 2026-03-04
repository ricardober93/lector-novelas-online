## Context

- The homepage fails to render due to a JavaScript error encountered during data fetch from the API.
- The failure blocks user interaction and degrades perceived reliability of the app.
- This change focuses on frontend resilience: improved error handling, recovery UI, and diagnostic logging.

## Goals / Non-Goals

- Goals:
  - Page renders without uncaught errors.
  - Present a clear, user-friendly error message or fallback UI when API calls fail.
  - Keep existing features intact and minimize regression surface.

- Non-Goals:
  - Backend API changes unless required by the fix.
  - Global architectural changes beyond the data-fetching layer.

## Decisions

- Use try/catch around API calls with a centralized error boundary for the page.
- Introduce a lightweight fallback UI for data fetch failures (loading skeleton + error toast).
- Add diagnostic telemetry to capture failure rate and error messages (no PII).

## Risks / Trade-offs

- Risk: Adding error boundaries could hide real errors if not surfaced properly.
- Mitigation: Ensure user-visible error messaging and metrics on failures; keep logs concise.

## Migration Plan

- No database or backend migration required.
- If API contract changes are later needed, introduce feature flags and versioned endpoints.

## Open Questions

- Do we want persistent offline support or a simple Retry button?
