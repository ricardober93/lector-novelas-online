# Magic Link Authentication

## Requirements

### Requirement: Graceful token consumption
The system SHALL handle missing verification tokens without throwing errors. When a verification token does not exist, the system SHALL return null and allow the authentication flow to continue gracefully.

#### Scenario: Valid token consumed successfully
- **WHEN** user clicks magic link with valid unused token
- **THEN** system deletes the token and authenticates the user

#### Scenario: Duplicate link click handled gracefully
- **WHEN** user clicks magic link that was already used
- **THEN** system returns null for token lookup and redirects to login page without error

#### Scenario: Expired token handled gracefully
- **WHEN** user clicks magic link with expired token
- **THEN** system returns null and redirects to login page with appropriate message

### Requirement: Single adapter-based user creation
The system SHALL rely solely on PrismaAdapter for user creation during authentication. Manual user creation in callbacks SHALL be removed to prevent race conditions.

#### Scenario: New user authenticates
- **WHEN** new user clicks magic link
- **THEN** PrismaAdapter creates user account automatically

#### Scenario: Existing user authenticates
- **WHEN** existing user clicks magic link
- **THEN** user is authenticated without duplicate creation attempts
