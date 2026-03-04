## ADDED Requirements

### Requirement: Homepage renders with defensive data validation
The system SHALL validate API response structure before processing and gracefully handle unexpected data formats.

#### Scenario: API returns wrapped object structure
- **WHEN** the `/api/series` endpoint returns `{ series: [...] }`
- **THEN** the homepage extracts the series array and renders successfully

#### Scenario: API returns unexpected structure
- **WHEN** the API returns data in an unexpected format (null, object without series key, etc.)
- **THEN** the homepage renders with empty series array instead of crashing
- **AND** an error is logged to console for debugging

### Requirement: Homepage shows skeleton loading states
The system SHALL display skeleton placeholders during data loading instead of plain text.

#### Scenario: Initial page load
- **WHEN** the homepage is loading for the first time
- **THEN** skeleton cards are displayed in the series grid
- **AND** skeleton items are displayed in the reading history section (if applicable)

#### Scenario: Loading completes successfully
- **WHEN** data loading completes with valid data
- **THEN** skeletons are replaced with actual content
- **AND** no visual layout shift occurs during transition

### Requirement: Homepage isolates section failures with error boundaries
The system SHALL wrap major sections in error boundaries so partial failures do not break the entire page.

#### Scenario: Reading history fails to load
- **WHEN** the reading history API call fails
- **THEN** the reading history section is hidden or shows a subtle error message
- **AND** the series grid section continues to function normally

#### Scenario: Series grid fails to load
- **WHEN** the series API call fails
- **THEN** the series grid section shows an error message with retry option
- **AND** the reading history section (if loaded) continues to display

#### Scenario: Both sections fail to load
- **WHEN** both reading history and series API calls fail
- **THEN** both sections show appropriate error states
- **AND** the page header and navigation remain functional

### Requirement: Homepage provides retry mechanism for failed API calls
The system SHALL allow users to retry failed data fetches without reloading the entire page.

#### Scenario: User retries series fetch
- **WHEN** the series API call has failed
- **AND** the user clicks the retry button
- **THEN** the API call is retried
- **AND** loading state is shown during retry
- **AND** success or error state is displayed based on retry result

#### Scenario: User retries reading history fetch
- **WHEN** the reading history API call has failed
- **AND** the user clicks retry (if error is visible)
- **THEN** the API call is retried
- **AND** the section updates based on retry result

### Requirement: Error messages are user-friendly
The system SHALL display clear, actionable error messages instead of technical jargon.

#### Scenario: API returns error status
- **WHEN** an API call returns 500, timeout, or network error
- **THEN** a user-friendly message is displayed (e.g., "No se pudieron cargar las series")
- **AND** a retry button is provided when applicable
- **AND** no technical error details are shown to end users

#### Scenario: Data structure validation fails
- **WHEN** API data doesn't match expected structure
- **THEN** a generic error message is shown
- **AND** technical details are logged to console for developers
- **AND** user sees actionable retry option
