# Admin Integration Cases

## Case: Admin panel is accessible to admin

- **GIVEN** a user with the ADMIN role is signed in
- **WHEN** the user opens `/admin`
- **THEN** the moderation queue is visible

## Case: Moderation approval is possible

- **GIVEN** a pending moderation item exists
- **WHEN** the admin approves the item
- **THEN** the moderation status changes to approved

## Case: Moderation rejection is possible

- **GIVEN** a pending moderation item exists
- **WHEN** the admin rejects the item with notes
- **THEN** the moderation status changes to rejected
- **AND** the notes are preserved

## Case: Non-admin is blocked from admin panel

- **GIVEN** a signed-in user is not an admin
- **WHEN** the user opens `/admin`
- **THEN** the user cannot access the moderation queue

