# Reader Layout

## MODIFIED Requirements

### Requirement: Responsive Container Width
The reader container width SHALL adapt to different screen sizes for optimal reading experience.

#### Scenario: Mobile container width
- **WHEN** user views on mobile (< 768px)
- **THEN** container width is 100% with minimal padding (1rem)

#### Scenario: Tablet container width
- **WHEN** user views on tablet (768px-1024px)
- **THEN** container width is max-w-3xl (768px)

#### Scenario: Desktop container width
- **WHEN** user views on desktop (> 1024px)
- **THEN** container width is max-w-4xl (896px)

### Requirement: Image Scaling
Images SHALL scale proportionally while maintaining aspect ratio across all devices.

#### Scenario: Mobile image scaling
- **WHEN** user views on mobile
- **THEN** images fit width of container with height auto-adjusted

#### Scenario: Desktop image scaling
- **WHEN** user views on desktop
- **THEN** images fit container with max-width constraint

### Requirement: UI Element Visibility
UI elements SHALL show/hide based on device capabilities and user interaction.

#### Scenario: Mobile UI visibility
- **WHEN** user is on mobile
- **THEN** UI controls auto-hide after 3 seconds of inactivity

#### Scenario: Desktop UI visibility
- **WHEN** user is on desktop
- **THEN** UI controls remain visible

### Requirement: Safe Area Insets
The reader SHALL respect device safe areas (notches, camera cutouts) on all devices.

#### Scenario: iPhone notch
- **WHEN** user views on iPhone
- **THEN** reader adds 44px top padding to avoid notch

#### Scenario: Android navigation bar
- **WHEN** user views on Android
- **THEN** reader adds 24px bottom padding to avoid navigation bar
