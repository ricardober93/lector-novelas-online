## ADDED Requirements

### Requirement: Cancel upload operation
The system SHALL allow users to cancel an in-progress file upload operation.

#### Scenario: Cancel individual file upload
- **WHEN** user is uploading files individually
- **THEN** user SHALL be able to click a "Cancel" button to stop the upload process

#### Scenario: Cancel ZIP file upload
- **WHEN** user is uploading a ZIP file
- **THEN** user SHALL be able to click a "Cancel" button to abort the upload

#### Scenario: Upload in progress shows cancel option
- **WHEN** an upload is in progress
- **THEN** the UI SHALL display a "Cancel" button alongside the upload progress

### Requirement: Proper cleanup on cancellation
The system SHALL clean up resources and state when an upload is cancelled.

#### Scenario: Network request abortion
- **WHEN** user cancels an upload
- **THEN** the system SHALL abort the active network request using AbortController

#### Scenario: State reset after cancellation
- **WHEN** user cancels an upload
- **THEN** the uploading state SHALL be reset to false

#### Scenario: Files list preserved after cancellation
- **WHEN** user cancels an upload
- **THEN** the selected files list SHALL remain available for re-upload attempt

### Requirement: User feedback on cancellation
The system SHALL provide clear feedback when an upload is cancelled.

#### Scenario: Cancellation confirmation message
- **WHEN** user cancels an upload
- **THEN** the system SHALL display a message indicating the upload was cancelled

#### Scenario: Visual state change on cancellation
- **WHEN** user cancels an upload
- **THEN** the UI SHALL update to show the cancelled state (e.g., progress bar resets)

### Requirement: Partial upload handling
The system SHALL handle partially completed uploads when cancelled.

#### Scenario: Individual uploads cancelled mid-sequence
- **WHEN** user cancels during sequential individual file uploads
- **THEN** the system SHALL stop uploading remaining files
- **AND** the system SHALL NOT rollback already completed uploads

#### Scenario: Error handling after cancellation
- **WHEN** user cancels an upload and then attempts to re-upload
- **THEN** the system SHALL allow a fresh upload attempt without errors

### Requirement: Accessibility
The cancel functionality SHALL be accessible to all users.

#### Scenario: Keyboard navigation
- **WHEN** user navigates using keyboard
- **THEN** the cancel button SHALL be focusable and activatable with Enter/Space keys

#### Scenario: Screen reader support
- **WHEN** screen reader user is uploading
- **THEN** the cancel button SHALL have appropriate aria-label describing its purpose
