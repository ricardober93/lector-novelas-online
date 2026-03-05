## 1. Setup

- [ ] 1.1 Create feature branch for fix-home-series-map-error
- [ ] 1.2 Verify existing ErrorBoundary component functionality

## 2. Core Implementation

- [ ] 2.1 Fix data handling in page.tsx with defensive validation
- [ ] 2.2 Create SeriesCardSkeleton component
- [ ] 2.3 Create HistoryItemSkeleton component
- [ ] 2.4 Replace loading state with skeleton components in page.tsx
- [ ] 2.5 Create SeriesErrorFallback component with retry button
- [ ] 2.6 Create HistoryErrorFallback component (silent failure)
- [ ] 2.7 Wrap reading history section in ErrorBoundary
- [ ] 2.8 Wrap series grid section in ErrorBoundary
- [ ] 2.9 Add retry mechanism using SWR mutate function

## 3. Testing & Validation

- [ ] 3.1 Test with API returning wrapped object structure
- [ ] 3.2 Test with API returning unexpected data structure
- [ ] 3.3 Test skeleton loading states appearance and transition
- [ ] 3.4 Test reading history failure isolation
- [ ] 3.5 Test series grid failure isolation
- [ ] 3.6 Test retry button functionality for series grid
- [ ] 3.7 Verify no regressions in other pages using /api/series
- [ ] 3.8 Manual QA: simulate network failures and verify graceful degradation

## 4. Documentation

- [ ] 4.1 Add inline comments explaining defensive validation logic
- [ ] 4.2 Update component props documentation if needed
