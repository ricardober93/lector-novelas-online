## 17. Magic Link Verification Fix

- [x] 17.1 Debug magic link verification flow (token not found issue)
- [x] 17.2 Add logging to useVerificationToken to track token lookup
- [ ] 17.3 Verify token is being created correctly in database
- [ ] 17.4 Check if token is being deleted before verification
- [ ] 17.5 Test magic link flow end-to-end
- [ ] 17.6 Verify email URL encoding is correct
- [ ] 17.7 Test with real email provider (Resend)

## 1. Logger Utility Setup

- [x] 1.1 Create src/lib/logger.ts with environment-aware logging functions
- [x] 1.2 Replace all console.log statements in client components with logger utility
- [x] 1.3 Replace all console.log statements in API routes with logger utility
- [x] 1.4 Replace all console.warn statements with logger.warn
- [x] 1.5 Replace all console.debug statements with logger.debug
- [x] 1.6 Test logger in development environment (verify logs appear)
- [x] 1.7 Test logger in production environment (verify logs suppressed)

## 2. Memory Leak Fixes

- [x] 2.1 Refactor ChapterReader to use refs for page elements instead of querySelector
- [x] 2.2 Update IntersectionObserver cleanup to set observerRef.current to null
- [x] 2.3 Test reader component with rapid navigation (verify no memory growth)
- [x] 2.4 Use React DevTools Profiler to verify proper cleanup on unmount
- [x] 2.5 Monitor memory usage in production after deployment

## 3. Upload Cancellation Implementation

- [x] 3.1 Add AbortController ref to ChapterUploadForm component
- [x] 3.2 Pass abort signal to fetch requests in handleUploadIndividual
- [x] 3.3 Implement handleCancel function to abort uploads
- [x] 3.4 Add "Cancel" button to UI during uploads
- [x] 3.5 Update state on cancellation (uploading=false, preserve files list)
- [x] 3.6 Handle AbortError in catch blocks gracefully
- [x] 3.7 Add cancellation message to UI when upload is cancelled
- [x] 3.8 Test cancellation during slow network conditions
- [x] 3.9 Test cancellation mid-sequence (verify partial uploads remain)
- [x] 3.10 Add aria-label to cancel button for accessibility
- [x] 3.11 Verify cancel button is keyboard accessible

## 4. Authentication Protection

- [x] 4.1 Add /read/* paths to middleware matcher config
- [x] 4.2 Remove client-side redirect from src/app/read/[id]/page.tsx
- [x] 4.3 Test authentication flow for protected routes
- [x] 4.4 Verify redirect to login works correctly
- [x] 4.5 Test with authenticated and unauthenticated users

## 5. Image Optimization

- [x] 5.1 Install and configure SWR dependency
- [x] 5.2 Create src/lib/fetcher.ts utility function
- [x] 5.3 Update ChapterReader PageImage to use Next.js Image component
- [x] 5.4 Add width and height props from API data to Image components
- [x] 5.5 Implement priority={true} for first 3 chapter pages
- [x] 5.6 Implement loading="eager" for first 3 chapter pages
- [x] 5.7 Implement loading="lazy" for remaining chapter pages
- [x] 5.8 Add blur placeholder for images (or placeholder="empty")
- [x] 5.9 Implement onLoad handler for fade-in effect
- [x] 5.10 Implement onError handler for fallback display
- [x] 5.11 Update series cover images on homepage to use Next.js Image
- [x] 5.12 Add priority={true} for first 6 series cover images
- [x] 5.13 Add descriptive alt text to all Image components
- [ ] 5.14 Test image loading on slow network
- [ ] 5.15 Verify no layout shift during image load

## 6. Client-Side Caching with SWR

- [x] 6.1 Migrate src/app/page.tsx to use SWR for series fetching
- [x] 6.2 Migrate src/app/page.tsx to use SWR for reading history
- [x] 6.3 Migrate src/app/read/[id]/page.tsx to use SWR for chapter data
- [x] 6.4 Migrate src/app/read/[id]/page.tsx to use SWR for navigation data
- [x] 6.5 Migrate src/app/series/[id]/page.tsx to use SWR for series data
- [x] 6.6 Migrate src/app/series/[id]/page.tsx to use SWR for reading progress
- [ ] 6.7 Implement cache invalidation after chapter upload
- [ ] 6.8 Implement cache invalidation after moderation actions
- [ ] 6.9 Configure revalidation intervals for different data types
- [ ] 6.10 Test cached data display while offline
- [ ] 6.11 Test automatic revalidation on window focus
- [ ] 6.12 Clear user-specific cache on logout

## 7. Prefetching for Navigation

- [x] 7.1 Add onMouseEnter handler to "Next Chapter" button
- [x] 7.2 Prefetch next chapter data on hover
- [x] 7.3 Add onMouseEnter handler to "Previous Chapter" button
- [x] 7.4 Prefetch previous chapter data on hover
- [x] 7.5 Add onMouseEnter handler to series links
- [x] 7.6 Prefetch series data on hover
- [ ] 7.7 Test prefetching with network throttling
- [ ] 7.8 Verify no unnecessary requests are made

## 8. Type Safety Improvements

- [x] 8.1 Replace `any` in src/app/api/series/route.ts with Prisma.SeriesWhereInput
- [x] 8.2 Replace `any` in src/app/api/chapters/route.ts with Prisma.ChapterWhereInput
- [x] 8.3 Replace `any` in src/app/series/[id]/page.tsx with proper ReadingHistoryItem type
- [x] 8.4 Replace `any` in src/app/api/admin/moderation/route.ts with proper enum type
- [x] 8.5 Fix hardcoded `isAdult: true` to `isAdult: boolean` in read page types
- [ ] 8.6 Run TypeScript compiler in strict mode and fix errors
- [ ] 8.7 Verify no TypeScript errors in build

## 9. Email Validation

- [x] 9.1 Create email validation utility function
- [x] 9.2 Add client-side validation to login form email input
- [x] 9.3 Display validation error message when email is invalid
- [x] 9.4 Add visual error state to input field (red border)
- [ ] 9.5 Test with invalid email formats
- [ ] 9.6 Test with valid email formats
- [ ] 9.7 Ensure submit button works only with valid email

## 10. CSS and UI Fixes

- [x] 10.1 Update body font-family in globals.css to use CSS variables
- [x] 10.2 Improve loading states with spinner or skeleton UI
- [x] 10.3 Add animated spinner component for loading states
- [x] 10.4 Update all "Cargando..." text states to use spinner
- [ ] 10.5 Test across different browsers (Chrome, Firefox, Safari)
- [ ] 10.6 Test responsive design on mobile devices

## 11. Rate Limiting Setup

- [ ] 11.1 Install @upstash/redis and @upstash/ratelimit dependencies
- [ ] 11.2 Create Upstash Redis account and get API credentials
- [ ] 11.3 Add UPSTASH_REDIS_REST_URL to .env.local
- [ ] 11.4 Add UPSTASH_REDIS_REST_TOKEN to .env.local
- [ ] 11.5 Create src/lib/rate-limit.ts with Ratelimit configuration
- [ ] 11.6 Add rate limiting to sendVerificationRequest in auth.ts
- [ ] 11.7 Return HTTP 429 when rate limit exceeded
- [ ] 11.8 Add X-RateLimit headers to responses
- [ ] 11.9 Add rate limit error handling on client side
- [ ] 11.10 Display retry information when rate limited
- [ ] 11.11 Test rate limiting with multiple rapid requests
- [ ] 11.12 Verify rate limit bypass for admin users
- [ ] 11.13 Add rate limit event logging

## 12. Adult Content Validation

- [ ] 12.1 Add adult content check in src/app/series/[id]/page.tsx
- [ ] 12.2 Redirect to homepage if user lacks adult content permission
- [ ] 12.3 Add toast notification explaining access denial
- [ ] 12.4 Add adult content check in src/app/read/[id]/page.tsx
- [ ] 12.5 Test with adult content series
- [ ] 12.6 Test with non-adult content series
- [ ] 12.7 Verify session.user.showAdult check works correctly

## 13. Error Handling Improvements

- [ ] 13.1 Add error boundaries to critical components
- [ ] 13.2 Improve error messages in API responses
- [ ] 13.3 Add user-friendly error pages (404, 500)
- [ ] 13.4 Implement retry mechanisms for failed requests
- [ ] 13.5 Add error logging to external service (optional)

## 14. Performance Testing and Monitoring

- [ ] 14.1 Run Lighthouse audit before changes (baseline)
- [ ] 14.2 Run Lighthouse audit after all changes
- [ ] 14.3 Verify Lighthouse Performance score improvement (target: 85+)
- [ ] 14.4 Measure Time to Interactive (target: <2.5s)
- [ ] 14.5 Measure bundle size before and after (target: reduction)
- [ ] 14.6 Test memory usage in reader over extended session
- [ ] 14.7 Set up Vercel Analytics for performance monitoring
- [ ] 14.8 Create performance monitoring dashboard (optional)

## 15. Documentation and Cleanup

- [ ] 15.1 Update README.md with new dependencies
- [ ] 15.2 Document logger utility usage
- [ ] 15.3 Document rate limiting configuration
- [ ] 15.4 Document SWR caching patterns
- [ ] 15.5 Document upload cancellation flow
- [ ] 15.6 Remove any commented-out code
- [ ] 15.7 Run ESLint and fix all warnings
- [ ] 15.8 Run TypeScript compiler and ensure no errors
- [ ] 15.9 Update .env.example with new environment variables

## 16. Final Testing and Deployment

- [ ] 16.1 Run full regression test on all features
- [ ] 16.2 Test authentication flow end-to-end
- [ ] 16.3 Test upload flow end-to-end
- [ ] 16.4 Test reading flow end-to-end
- [ ] 16.5 Test admin/creator flows
- [ ] 16.6 Verify no console errors in production build
- [ ] 16.7 Deploy to staging environment
- [ ] 16.8 Monitor staging for 24-48 hours
- [ ] 16.9 Deploy to production
- [ ] 16.10 Monitor production for issues
- [ ] 16.11 Document rollback procedure if needed
