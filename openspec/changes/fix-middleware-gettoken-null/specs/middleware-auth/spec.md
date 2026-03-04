## ADDED Requirements

### Requirement: Middleware protects UI routes only
The middleware SHALL protect UI routes (/creator, /read, /admin) by checking for authenticated sessions. API routes SHALL NOT be protected by middleware as they implement their own authentication via getServerSession().

#### Scenario: Unauthenticated user accesses protected UI route
- **WHEN** unauthenticated user navigates to /creator, /read, or /admin
- **THEN** middleware redirects to /login page

#### Scenario: Authenticated user accesses protected UI route
- **WHEN** authenticated user navigates to /creator, /read, or /admin
- **THEN** middleware allows access to the route

#### Scenario: API route request processed without middleware
- **WHEN** request is made to /api/* endpoint
- **THEN** middleware does not intercept the request
- **AND** API route handler performs authentication via getServerSession()

### Requirement: Admin routes require ADMIN role
The middleware SHALL restrict access to admin routes (/admin, /api/admin) to users with ADMIN role only.

#### Scenario: Non-admin user accesses admin UI route
- **WHEN** authenticated user without ADMIN role navigates to /admin
- **THEN** middleware redirects to home page

#### Scenario: Admin user accesses admin UI route
- **WHEN** authenticated user with ADMIN role navigates to /admin
- **THEN** middleware allows access

#### Scenario: Unauthenticated user accesses admin route
- **WHEN** unauthenticated user navigates to /admin
- **THEN** middleware redirects to /login page
