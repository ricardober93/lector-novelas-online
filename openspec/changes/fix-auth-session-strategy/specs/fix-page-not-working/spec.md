## ADDED Requirements

### Requirement: Session strategy uses JWT tokens
The system SHALL use JWT session strategy instead of database sessions for authentication and authorization.

#### Scenario: Session created as JWT token
- **WHEN** a user authenticates successfully
- **THEN** a JWT token is created containing user id, role, and metadata
- **AND** the JWT token is signed and stored in the session cookie
- **AND** no database session record is created

#### Scenario: Session validated from JWT token
- **WHEN** a request includes a session cookie
- **THEN** the JWT token is decoded and validated
- **AND** no database lookup is performed for session validation
- **AND** the session data is extracted from the JWT token payload

#### Scenario: Role changes apply on next login
- **WHEN** a user's role is changed in the database (e.g., ADMIN to READER)
- **THEN** the change SHALL NOT apply immediately to active sessions
- **AND** the change SHALL apply when the user logs in again
- **AND** the new JWT token SHALL contain the updated role

## REMOVED Requirements

### Requirement: Sessions stored in database
**Reason**: Replaced by JWT session strategy for better performance and middleware compatibility
**Migration**: Existing sessions table becomes unused. Active users must re-authenticate to get new JWT tokens. Database sessions table can be truncated or kept for rollback purposes.
