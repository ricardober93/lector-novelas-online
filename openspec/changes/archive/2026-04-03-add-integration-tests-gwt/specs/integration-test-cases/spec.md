# Integration Test Cases

## ADDED Requirements

### Requirement: The project SHALL keep a structured catalog of integration cases
The system SHALL define integration test cases in a dedicated folder grouped by user flow so they can be translated into executable tests without ambiguity.

#### Scenario: Auth cases are discoverable
- **WHEN** a developer opens the integration test catalog
- **THEN** auth cases are grouped under a dedicated auth section
- **AND** each case includes Given, When, and Then steps

#### Scenario: Reader cases are discoverable
- **WHEN** a developer opens the integration test catalog
- **THEN** reader cases are grouped under a dedicated reader section
- **AND** each case names the observable UI state being verified

### Requirement: Each integration case SHALL be written in Given / When / Then form
Every case SHALL define an initial state, one user action or system event, and one observable result.

#### Scenario: Login case is precise
- **WHEN** the login case is documented
- **THEN** it states the input email or account state in Given
- **AND** it states the exact user action in When
- **AND** it states the expected redirect or UI state in Then

#### Scenario: Route protection case is precise
- **WHEN** the protected-route case is documented
- **THEN** it states whether the user is authenticated or not in Given
- **AND** it states the route visited in When
- **AND** it states the resulting redirect or access in Then

### Requirement: The catalog SHALL cover the critical product flows
The system SHALL include cases for authentication, discovery, reader navigation, creator actions, admin moderation, and responsive navigation.

#### Scenario: Authentication is covered
- **WHEN** the catalog is reviewed
- **THEN** it includes login success, login failure, logout, and unauthorized redirect cases

#### Scenario: Reader flow is covered
- **WHEN** the catalog is reviewed
- **THEN** it includes home load, series open, chapter open, and chapter navigation cases

#### Scenario: Creator and admin flows are covered
- **WHEN** the catalog is reviewed
- **THEN** it includes creator access and admin moderation cases

### Requirement: The catalog SHALL include at least one off-happy-path case per critical flow
Each critical area SHALL include at least one negative or edge-case scenario.

#### Scenario: Invalid email is covered
- **WHEN** the auth catalog is reviewed
- **THEN** it includes an invalid-email validation case

#### Scenario: Unauthorized access is covered
- **WHEN** the protected-route catalog is reviewed
- **THEN** it includes a no-session redirect case

#### Scenario: Responsive layout is covered
- **WHEN** the navigation catalog is reviewed
- **THEN** it includes at least one mobile drawer case and one desktop state case
