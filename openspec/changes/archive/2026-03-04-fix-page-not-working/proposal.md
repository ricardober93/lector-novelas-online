## Why
Fix the homepage not loading due to a JavaScript error when fetching data from the API. The page currently shows a blank screen or a generic error message. This blocks users from accessing the app and degrades user experience. The change introduces targeted frontend fixes, improved error handling, and basic diagnostics to aid future debugging.

## What Changes
Frontend-only changes to improve data-fetch resilience: add error handling, a user-facing error banner, and a retry mechanism.

## Scope
Frontend only (no backend API changes unless needed by the fix).
Local UI server loads the homepage but the fix should apply to all routes that rely on the same data fetch pattern.

## Goals & Success Criteria
- The homepage renders successfully without uncaught errors.
- Users see a meaningful error message or fallback UI when API calls fail.
- No regressions in other pages that rely on similar data fetching logic.

## Artifacts
- proposal.md describes the problem and rationale for the change.

## ADDED Requirements

### Requirement: Error visibility
- The UI SHALL display a non-intrusive error banner when API data fails to load.

#### Scenario: API load failure
- **WHEN** the API responds with an error or times out
- **THEN** the error banner is visible and a retry control is offered
