# Auth Integration Cases

## Case: Magic link login succeeds

- **Given** a valid email address and a working auth/email setup
- **When** the user submits the login form
- **Then** the UI confirms that a magic link email was sent
- **And** the email contains a callback link that returns the user to the app

**Data**
- Existing email delivery configuration
- Any valid user email, for example `qa-reader@example.com`

**Checks**
- Login page shows the success state
- No validation error is visible
- The form is disabled while the request is in flight

## Case: Invalid email is rejected

- **Given** the login form is visible
- **When** the user submits an invalid email format
- **Then** the form shows a validation error
- **And** no login request is sent

**Data**
- None

**Checks**
- Validation message is visible
- The success state is not shown
- The app remains on `/login`

## Case: Unauthenticated user is redirected from a protected route

- **Given** no active session exists
- **When** the user visits `/creator`, `/read/:id`, or `/admin`
- **Then** the user is redirected to `/login`

**Data**
- No session cookie
- A valid protected route path

**Checks**
- Final URL is `/login`
- Protected content is not visible

## Case: Signed-in user can sign out

- **Given** an active session exists
- **When** the user clicks sign out
- **Then** the session is cleared
- **And** the navigation returns to the unauthenticated state

**Data**
- Any authenticated user

**Checks**
- `Perfil` and `Cerrar sesión` disappear
- `Ingresar` appears again
- Session cookies are removed or invalidated

