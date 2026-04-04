# Auth Integration Cases

## Case: Magic link login succeeds

- **GIVEN** a valid email address and an existing auth service configuration
- **WHEN** the user submits the login form and receives a magic link
- **THEN** the UI confirms that the email was sent
- **AND** the user can complete sign-in from the magic-link flow

## Case: Invalid email is rejected

- **GIVEN** the login form is visible
- **WHEN** the user submits an invalid email format
- **THEN** the form shows a validation message
- **AND** no auth request is sent

## Case: Unauthenticated user is redirected from protected routes

- **GIVEN** no active session exists
- **WHEN** the user visits `/creator`, `/read/:id`, or `/admin`
- **THEN** the user is redirected to `/login`

## Case: Signed-in user can sign out

- **GIVEN** an active session exists
- **WHEN** the user clicks sign out
- **THEN** the session is cleared
- **AND** the navigation returns to the unauthenticated state

