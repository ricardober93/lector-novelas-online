## Why

The homepage crashes with `TypeError: series.map is not a function` because the API returns `{ series: [...] }` (wrapped object) but the client code expects a direct array. This blocks users from accessing the application and degrades user experience. Additionally, the current error handling is fragile - any data structure mismatch causes the entire page to fail instead of degrading gracefully.

## What Changes

- Fix client-side data handling in `page.tsx` to correctly unwrap the series array from API response
- Add defensive validation before calling `.map()` on series data
- Improve loading states with skeleton components instead of plain "Cargando..." text
- Implement section-level error boundaries so partial failures don't break the entire page
- Add retry mechanism for failed API calls
- Enhance error messaging with user-friendly messages and actionable retry buttons

## Capabilities

### New Capabilities
- `home-resilience`: Robust data fetching with defensive validation, skeleton loading states, section-level error boundaries, and graceful degradation when API calls fail

### Modified Capabilities
- `error-handling`: Enhanced error boundary pattern with section-level isolation and retry mechanisms

## Impact

- Frontend only: `src/app/page.tsx`, `src/components/` (new skeleton components, enhanced error boundary)
- No backend API changes required
- Affects home page rendering and error recovery UX
- May affect other pages using similar data fetching patterns (need to verify)
