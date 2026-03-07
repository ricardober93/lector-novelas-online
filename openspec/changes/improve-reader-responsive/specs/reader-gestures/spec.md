# Reader Gestures

## ADDED Requirements

### Requirement: Swipe Navigation
The system SHALL support horizontal swipe gestures for page navigation on mobile devices.

#### Scenario: User swipes right
- **WHEN** user swipes from right to left on mobile
- **THEN** system navigates to next page

#### Scenario: User swipes left
- **WHEN** user swipes from left to right on mobile
- **THEN** system navigates to previous page

#### Scenario: Swipe on last page
- **WHEN** user swipes right on last page
- **THEN** system shows "End of chapter" message

### Requirement: Tap Zone Navigation
The system SHALL divide the screen into three vertical zones for navigation.

#### Scenario: User taps left zone
- **WHEN** user taps left 33% of screen width
- **THEN** system navigates to previous page

#### Scenario: User taps center zone
- **WHEN** user taps center 33% of screen width
- **THEN** system toggles UI controls visibility

#### Scenario: User taps right zone
- **WHEN** user taps right 33% of screen width
- **THEN** system navigates to next page

### Requirement: Gesture Threshold
Swipe gestures MUST have minimum threshold to avoid accidental activation.

#### Scenario: Small touch movement
- **WHEN** user touches screen and moves less than 50px horizontally
- **THEN** system does NOT navigate pages

#### Scenario: Clear swipe
- **WHEN** user swipes more than 50px horizontally
- **THEN** system navigates pages

### Requirement: Desktop Gesture Exclusion
Touch gestures SHALL NOT be active on desktop devices to avoid conflicts with scroll behavior.

#### Scenario: User on desktop
- **WHEN** user is on desktop device with mouse
- **THEN** touch gestures are disabled

#### Scenario: User on mobile
- **WHEN** user is on mobile device with touchscreen
- **THEN** touch gestures are enabled
