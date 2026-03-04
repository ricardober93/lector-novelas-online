## ADDED Requirements

### Requirement: Rate limit authentication requests
The system SHALL implement rate limiting on authentication endpoints to prevent abuse.

#### Scenario: Limit magic link requests
- **WHEN** user requests a magic link
- **THEN** the system SHALL allow maximum 3 requests per email per hour

#### Scenario: Block excessive requests
- **WHEN** user exceeds the rate limit
- **THEN** the system SHALL reject the request with HTTP 429 status

#### Scenario: Rate limit error message
- **WHEN** rate limit is exceeded
- **THEN** the system SHALL return a clear error message indicating when to retry

### Requirement: Rate limit headers
The system SHALL include rate limit information in response headers.

#### Scenario: Include limit headers
- **WHEN** rate limiting is active
- **THEN** response SHALL include X-RateLimit-Limit header showing max requests

#### Scenario: Include remaining headers
- **WHEN** rate limiting is active
- **THEN** response SHALL include X-RateLimit-Remaining header showing remaining requests

#### Scenario: Include reset headers
- **WHEN** rate limiting is active
- **THEN** response SHALL include X-RateLimit-Reset header showing when limit resets

### Requirement: Sliding window rate limiting
The system SHALL use sliding window algorithm for rate limiting.

#### Scenario: Sliding window calculation
- **WHEN** checking rate limit
- **THEN** the system SHALL count requests in the past hour, not fixed hour blocks

#### Scenario: Gradual limit recovery
- **WHEN** old requests age out of the window
- **THEN** the available request count SHALL increase gradually

### Requirement: Rate limit bypass for admins
The system SHALL allow administrators to bypass rate limiting.

#### Scenario: Admin user unlimited
- **WHEN** request is from an authenticated admin user
- **THEN** the system SHALL not apply rate limiting

#### Scenario: Admin role verification
- **WHEN** checking for rate limit bypass
- **THEN** the system SHALL verify user.role === "ADMIN"

### Requirement: Rate limit monitoring
The system SHALL log rate limit events for monitoring.

#### Scenario: Log rate limit exceeded
- **WHEN** a request is rate limited
- **THEN** the system SHALL log the event with email/IP and timestamp

#### Scenario: Monitor rate limit patterns
- **WHEN** rate limit events occur
- **THEN** administrators SHALL be able to review logs for abuse patterns

### Requirement: Graceful degradation without Redis
The system SHALL handle Redis unavailability gracefully.

#### Scenario: Fallback when Redis unavailable
- **WHEN** Redis connection fails
- **THEN** the system SHALL allow requests with a warning log

#### Scenario: Alert on Redis failure
- **WHEN** Redis is unavailable
- **THEN** the system SHALL log an error for monitoring

### Requirement: Client-side rate limit handling
The system SHALL handle rate limit errors gracefully on the client.

#### Scenario: Display retry information
- **WHEN** client receives HTTP 429
- **THEN** the UI SHALL display when the user can retry

#### Scenario: Disable submit button
- **WHEN** rate limit is active
- **THEN** the submit button SHALL be disabled with appropriate message

#### Scenario: Countdown timer (optional)
- **WHEN** rate limit is active
- **THEN** the UI MAY display a countdown timer until limit resets

### Requirement: Rate limit configuration
The system SHALL make rate limits configurable.

#### Scenario: Environment variable configuration
- **WHEN** deploying the system
- **THEN** rate limits SHALL be configurable via environment variables

#### Scenario: Different limits per endpoint
- **WHEN** configuring rate limiting
- **THEN** different endpoints SHALL support different rate limits

### Requirement: IP-based rate limiting (future)
The system SHALL support IP-based rate limiting as an additional layer.

#### Scenario: IP rate limit alongside email
- **WHEN** IP-based rate limiting is enabled
- **THEN** the system SHALL limit requests per IP address in addition to per-email limits

#### Scenario: IP limit higher than email limit
- **WHEN** implementing IP-based rate limiting
- **THEN** IP limits SHALL be higher to account for shared networks (e.g., 10 per hour)
