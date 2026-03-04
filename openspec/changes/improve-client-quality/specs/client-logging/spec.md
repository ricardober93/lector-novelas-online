## ADDED Requirements

### Requirement: Environment-aware logging
The system SHALL provide a centralized logging utility that respects the NODE_ENV environment variable.

#### Scenario: Logs in development environment
- **WHEN** NODE_ENV is "development"
- **THEN** logger.log(), logger.warn(), and logger.debug() SHALL output to console

#### Scenario: Logs suppressed in production
- **WHEN** NODE_ENV is "production"
- **THEN** logger.log(), logger.warn(), and logger.debug() SHALL NOT output to console

#### Scenario: Errors always logged
- **WHEN** logger.error() is called in any environment
- **THEN** the error SHALL be output to console

### Requirement: Replace all console statements
The system SHALL replace all console.log, console.warn, and console.debug statements with the logger utility.

#### Scenario: Client-side logging
- **WHEN** a client component needs to log information
- **THEN** it SHALL use logger.log() instead of console.log()

#### Scenario: Server-side logging
- **WHEN** an API route or server component needs to log information
- **THEN** it SHALL use logger.log() instead of console.log()

#### Scenario: Error logging in catch blocks
- **WHEN** an error is caught in a try-catch block
- **THEN** it SHALL use logger.error() to log the error

### Requirement: Structured logging format
The system SHALL provide consistent log formatting across the application.

#### Scenario: Log with context
- **WHEN** logging an event with context
- **THEN** the log SHALL include timestamp, log level, and contextual information

#### Scenario: Error log with stack trace
- **WHEN** logging an error
- **THEN** the log SHALL include error message and stack trace if available

### Requirement: No sensitive data in logs
The system SHALL prevent sensitive information from being logged.

#### Scenario: Password logging prevention
- **WHEN** logging user input or authentication data
- **THEN** passwords and tokens SHALL NOT be included in log output

#### Scenario: API key logging prevention
- **WHEN** logging API requests or responses
- **THEN** API keys and secrets SHALL be redacted or excluded from logs
