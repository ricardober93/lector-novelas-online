# Better Auth Authentication

## Requirements

### Requirement: Magic-link authentication uses Better Auth
The system SHALL authenticate users through Better Auth using an email magic-link flow.

#### Scenario: New user signs in
- **WHEN** a user requests a magic link with a valid email address
- **THEN** the system sends a sign-in link through the configured email provider
- **AND** the user can complete authentication without a password

#### Scenario: Existing user signs in
- **WHEN** an existing user requests a magic link
- **THEN** the system authenticates the same user record
- **AND** it does not create a duplicate user

### Requirement: Sessions expose Panels authorization claims
The system SHALL expose the authenticated user's `id`, `role`, and `showAdult` values in session data so the app can authorize routes and UI behavior.

#### Scenario: Creator session
- **WHEN** a creator user signs in
- **THEN** the session includes the user's id, role, and showAdult preference
- **AND** creator-only areas can read those claims

#### Scenario: Admin session
- **WHEN** an admin user signs in
- **THEN** the session includes the user's id, role, and showAdult preference
- **AND** admin-only areas can read those claims

### Requirement: Protected routes require authentication
The system SHALL prevent unauthenticated users from accessing protected areas of the app.

#### Scenario: Unauthenticated visitor accesses creator route
- **WHEN** an unauthenticated user visits a creator, reader, or admin route
- **THEN** the system redirects the user to the login page

#### Scenario: Unauthorized role accesses privileged route
- **WHEN** a reader user visits a creator or admin route
- **THEN** the system blocks access to that route

### Requirement: Existing users survive the migration
The system SHALL preserve existing user identities during the move from NextAuth to Better Auth.

#### Scenario: User with existing account signs in after migration
- **WHEN** an existing user signs in after the migration
- **THEN** the system matches the same email to the existing user
- **AND** the user keeps their Panels profile and permissions

#### Scenario: Old sessions are invalidated
- **WHEN** the Better Auth migration is deployed
- **THEN** previously issued NextAuth sessions stop working
- **AND** users must sign in again to establish new sessions
