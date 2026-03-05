## ADDED Requirements

### Requirement: Middleware can verify user roles
The system SHALL allow middleware to decode JWT tokens and verify user roles (ADMIN, CREATOR, READER) to control access to protected routes.

#### Scenario: Admin user accesses admin route
- **WHEN** an authenticated user with role "ADMIN" requests "/admin" or any "/admin/*" path
- **THEN** the middleware decodes the JWT token from the session cookie
- **AND** the middleware verifies the user role is "ADMIN"
- **AND** the request proceeds to the admin page

#### Scenario: Non-admin user blocked from admin route
- **WHEN** an authenticated user with role "READER" or "CREATOR" requests "/admin" or any "/admin/*" path
- **THEN** the middleware decodes the JWT token from the session cookie
- **AND** the middleware verifies the user role is not "ADMIN"
- **AND** the middleware redirects the user to "/"

#### Scenario: Creator user accesses creator route
- **WHEN** an authenticated user with role "CREATOR" or "ADMIN" requests "/creator" or any "/creator/*" path
- **THEN** the middleware decodes the JWT token from the session cookie
- **AND** the middleware verifies the user role is "CREATOR" or "ADMIN"
- **AND** the request proceeds to the creator page

#### Scenario: Unauthenticated user blocked from protected route
- **WHEN** an unauthenticated user requests any protected route (/admin, /creator, /read)
- **THEN** the middleware detects no valid JWT token in the session cookie
- **AND** the middleware redirects the user to "/login"

### Requirement: JWT token contains user role information
The system SHALL include user role information in the JWT token payload when the token is created.

#### Scenario: JWT token creation during login
- **WHEN** a user successfully authenticates via magic link
- **THEN** the jwt callback fetches the user's role from the database
- **AND** the jwt callback includes the role in the JWT token payload
- **AND** the JWT token is signed and stored in the session cookie

#### Scenario: JWT token includes user metadata
- **WHEN** a JWT token is created for a user
- **THEN** the token payload SHALL include: id (string), role (enum), showAdult (boolean)
- **AND** the token includes standard JWT claims: iat (issued at), exp (expiration)
- **AND** the token expiration is 30 days from creation date

### Requirement: Session callback populates user role from JWT token
The system SHALL populate session.user.role from the JWT token in the session callback.

#### Scenario: Session object contains user role
- **WHEN** the session callback is invoked with a JWT token
- **THEN** the callback SHALL extract the role from the token
- **AND** the callback SHALL set session.user.role to the extracted role value
- **AND** the session object returned to the client SHALL include the user's role

#### Scenario: Admin page verifies user role
- **WHEN** an admin page component checks session?.user?.role === "ADMIN"
- **THEN** the comparison SHALL return true for users with ADMIN role
- **AND** the admin page SHALL render for admin users
- **AND** the admin page SHALL redirect non-admin users to "/"
