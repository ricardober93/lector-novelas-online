## ADDED Requirements

### Requirement: Reproducible QA asset preparation
The system SHALL define a reproducible preparation flow for fantasy QA assets before upload.

#### Scenario: Asset set is prepared
- **WHEN** the team finishes generating the chapter images
- **THEN** the selected files SHALL be curated, renamed in stable numeric order, and stored as both an ordered folder and a ZIP package

#### Scenario: Upload-ready naming
- **WHEN** the assets are finalized for QA
- **THEN** the files SHALL use a deterministic naming convention such as `001`, `002`, `003`

### Requirement: Validation against current upload paths
The QA validation flow SHALL cover both upload mechanisms that already exist in the application.

#### Scenario: ZIP upload is tested
- **WHEN** the QA chapter is validated
- **THEN** the ordered ZIP package SHALL be uploaded through the chapter ZIP endpoint
- **AND** the resulting chapter SHALL preserve the intended page order and page count

#### Scenario: Individual upload is tested
- **WHEN** the QA chapter is validated through per-file upload
- **THEN** the same page set SHALL be uploaded one page at a time
- **AND** the resulting chapter SHALL preserve the intended page order and page count

### Requirement: Reader experience validation with real pages
The QA validation flow SHALL verify the reader experience using uploaded pages instead of development placeholders.

#### Scenario: Real chapter is opened
- **WHEN** the uploaded QA chapter is read in the application
- **THEN** the reader SHALL render stored page images rather than falling back to demo images

#### Scenario: Reading flow is reviewed
- **WHEN** the QA team validates the chapter experience
- **THEN** they SHALL review page loading, perceived pagination order, progress updates, and navigation behavior on mobile and desktop

### Requirement: Failure-mode coverage
The QA validation flow SHALL include negative and interruption scenarios relevant to the current upload implementation.

#### Scenario: Cancellation is exercised
- **WHEN** the team tests individual upload
- **THEN** the validation checklist SHALL include a cancellation attempt and a subsequent retry

#### Scenario: Invalid input is exercised
- **WHEN** the team executes the QA flow
- **THEN** the validation checklist SHALL include at least one invalid or unsuitable asset case such as wrong format or excessive size

### Requirement: Separation from demo-image fallback
The QA validation flow SHALL distinguish uploaded QA content from the existing development-only demo image fallback.

#### Scenario: Team selects test mode
- **WHEN** the team wants to validate upload and reader behavior end-to-end
- **THEN** they SHALL use the QA chapter with uploaded assets instead of relying on demo images

#### Scenario: Team uses placeholders
- **WHEN** the team only needs fast visual development without real content
- **THEN** they SHALL treat the existing demo image fallback as a separate development aid outside the QA validation flow
