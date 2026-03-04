## ADDED Requirements

### Requirement: Account record creation during email authentication
The system SHALL create an Account record in the database when a user authenticates via magic link for the first time. The Account record SHALL contain the provider type "email", provider account ID set to the user's email, and proper user reference.

#### Scenario: New user authenticates with magic link
- **WHEN** new user clicks magic link and completes authentication
- **THEN** system creates User, Account, and Session records
- **AND** Account record has provider="email", type="email", providerAccountId=user email

#### Scenario: Existing user without Account authenticates
- **WHEN** existing user who lacks Account record clicks magic link
- **THEN** system creates Account record linked to existing User
- **AND** authentication completes successfully

#### Scenario: Account creation failure is logged
- **WHEN** Account creation fails during authentication
- **THEN** system logs error with user ID and provider details
- **AND** authentication flow continues (non-blocking)

### Requirement: Authentication state validation
The system SHALL validate that Account records exist before considering authentication complete. If Account record is missing after authentication, the system SHALL attempt to create it.

#### Scenario: Missing Account detected post-authentication
- **WHEN** user authenticates but Account record is not found
- **THEN** system automatically creates Account record
- **AND** user session is established correctly

#### Scenario: Account record exists
- **WHEN** user with existing Account record authenticates
- **THEN** system skips Account creation
- **AND** authentication proceeds normally

### Requirement: Migration support for existing users
The system SHALL provide a migration mechanism to create Account records for existing users who authenticated via magic link before this fix was implemented.

#### Scenario: Migration script execution
- **WHEN** migration script runs
- **THEN** all users without Account records get Account records created
- **AND** Account records have correct provider metadata (email, type, providerAccountId)

#### Scenario: Migration is idempotent
- **WHEN** migration script runs multiple times
- **THEN** no duplicate Account records are created
- **AND** existing Account records remain unchanged
