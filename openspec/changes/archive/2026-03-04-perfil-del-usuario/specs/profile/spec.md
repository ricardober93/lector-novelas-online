## ADDED Requirements

-### Requirement: Load user profile
- The system SHALL load the current user's profile from the API and display it in the Profile screen.
#### Scenario: Avatar URL loads
- WHEN the API returns the avatar URL
- THEN the avatar image is displayed in the profile header

#### Scenario: Successful profile load
- WHEN the API returns the user data
- THEN the UI displays name, avatar URL, bio, and notification preferences populated with the data

-### Requirement: Update user profile
- The system SHALL update the user's profile via the API when the user saves changes.
#### Scenario: Avatar URL updated
- WHEN the user changes the avatar URL and saves
- THEN the avatar image updates in the UI and is persisted by the API

### ADDED Requirement: Avatar URL support
- The system SHALL store and display the user's avatar using a URL. The UI SHALL provide a live preview of the avatar as the URL changes.

#### Scenario: Live avatar URL preview
- WHEN the user edits the avatar URL field
- THEN the preview image updates in real-time

### ADDED Requirement: Notification preferences
- The system SHALL persist user notification preferences (e.g., email, in-app) in the profile.

#### Scenario: Update notification preferences
- WHEN the user toggles notification options and saves
- THEN the changes are persisted and reflected in subsequent loads

#### Scenario: Successful update
- WHEN the user edits fields and saves
- THEN the API responds with success and the UI reflects updated data

## MODIFIED Requirements

### Requirement: Validation & error handling on save
- The system SHALL validate required fields on the client before sending to API.
- If the API returns an error, the UI SHALL show an error message and keep the user input intact

## REMOVED Requirements

### Requirement: Deprecated profile fields
- Remove any fields not used by the new profile schema; Migration notes for frontend only
