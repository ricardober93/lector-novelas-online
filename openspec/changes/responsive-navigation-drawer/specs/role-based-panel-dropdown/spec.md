## ADDED Requirements

### Requirement: Role-Based Panel Dropdown
The navigation SHALL display a unified "Panel" dropdown menu that shows options based on the user's role (CREATOR or ADMIN).

#### Scenario: Creator User Sees Creator Panel
- **WHEN** user has CREATOR role
- **AND** user does NOT have ADMIN role
- **THEN** system SHALL display "Panel" dropdown
- **AND** dropdown SHALL contain "Creator Panel" option
- **AND** dropdown SHALL NOT contain "Admin Panel" option

#### Scenario: Admin User Sees Both Panels
- **WHEN** user has ADMIN role
- **THEN** system SHALL display "Panel" dropdown
- **AND** dropdown SHALL contain "Admin Panel" option
- **AND** dropdown SHALL contain "Creator Panel" option (since ADMIN has creator privileges)

#### Scenario: Regular User Sees No Panel Dropdown
- **WHEN** user does NOT have CREATOR or ADMIN role
- **THEN** system SHALL NOT display "Panel" dropdown
- **AND** system SHALL only display profile and sign out options

### Requirement: Panel Dropdown Functionality
The Panel dropdown SHALL be accessible via click and display options in a dropdown menu.

#### Scenario: Desktop Dropdown Opens on Click
- **WHEN** user is on desktop view (1024px or greater)
- **AND** user clicks on "Panel" dropdown trigger
- **THEN** system SHALL display dropdown menu below the trigger
- **AND** system SHALL show all available panel options for user's role

#### Scenario: Dropdown Closes on Selection
- **WHEN** dropdown is open
- **AND** user clicks on a panel option
- **THEN** system SHALL close the dropdown
- **AND** system SHALL navigate to the selected panel

#### Scenario: Dropdown Closes on Outside Click
- **WHEN** dropdown is open
- **AND** user clicks outside the dropdown
- **THEN** system SHALL close the dropdown

#### Scenario: Dropdown Closes on Escape Key
- **WHEN** dropdown is open
- **AND** user presses the Escape key
- **THEN** system SHALL close the dropdown

### Requirement: Panel Dropdown in Drawer
The Panel dropdown SHALL also function within the mobile/tablet drawer menu.

#### Scenario: Drawer Panel Menu Display
- **WHEN** user has CREATOR or ADMIN role
- **AND** user opens the navigation drawer on mobile/tablet
- **THEN** system SHALL display "Panel" section with available options
- **AND** options SHALL be displayed as clickable links (not a dropdown in drawer context)

#### Scenario: Drawer Panel Navigation
- **WHEN** user clicks a panel option in the drawer
- **THEN** system SHALL close the drawer
- **AND** system SHALL navigate to the selected panel

### Requirement: Panel Dropdown Accessibility
The Panel dropdown SHALL be accessible via keyboard and assistive technologies.

#### Scenario: Keyboard Dropdown Activation
- **WHEN** user focuses on "Panel" dropdown trigger
- **AND** user presses Enter or Space key
- **THEN** system SHALL open the dropdown menu

#### Scenario: Keyboard Navigation in Dropdown
- **WHEN** dropdown is open
- **THEN** user SHALL be able to navigate through options using Arrow Down/Up keys
- **AND** user SHALL be able to select option with Enter key
- **AND** user SHALL be able to close dropdown with Escape key

#### Scenario: Screen Reader Dropdown Support
- **WHEN** user accesses Panel dropdown with screen reader
- **THEN** system SHALL announce "Panel" as a dropdown menu
- **AND** system SHALL announce dropdown state (expanded/collapsed)
- **AND** system SHALL announce available options

### Requirement: Panel Dropdown Visual Design
The Panel dropdown SHALL have consistent styling with the application's design system.

#### Scenario: Dropdown Visual Consistency
- **WHEN** Panel dropdown is displayed
- **THEN** system SHALL use consistent colors with application theme (light/dark mode)
- **AND** system SHALL use consistent typography and spacing
- **AND** system SHALL show visual feedback on hover/focus states
- **AND** system SHALL display appropriate chevron icon indicating dropdown behavior

#### Scenario: Active Panel Indication
- **WHEN** user is currently viewing a panel page (creator or admin)
- **THEN** system SHALL visually indicate active state on the Panel dropdown trigger
- **AND** system SHALL maintain consistent active state styling with other navigation items
