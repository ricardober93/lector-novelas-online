# Admin Integration Cases

## Case: Admin panel is accessible to admin

- **Given** a user with the ADMIN role is signed in
- **When** the user opens `/admin`
- **Then** the moderation queue is visible

**Data**
- Authenticated admin user

**Checks**
- Moderation filter buttons are visible
- Queue rows are visible when data exists

## Case: Moderation approval is possible

- **Given** a pending moderation item exists
- **When** the admin approves the item
- **Then** the moderation status changes to approved

**Data**
- Pending moderation entry

**Checks**
- Approve button is visible
- The item disappears from the pending queue after approval

## Case: Moderation rejection is possible

- **Given** a pending moderation item exists
- **When** the admin rejects the item with notes
- **Then** the moderation status changes to rejected
- **And** the notes are preserved

**Data**
- Pending moderation entry
- Rejection note text

**Checks**
- Reject action updates the item
- Rejection notes are visible in the record

## Case: Non-admin is blocked from admin panel

- **Given** a signed-in user is not an admin
- **When** the user opens `/admin`
- **Then** the user cannot access the moderation queue

**Data**
- Authenticated non-admin user

**Checks**
- No moderation items are visible
- User is redirected or denied access

