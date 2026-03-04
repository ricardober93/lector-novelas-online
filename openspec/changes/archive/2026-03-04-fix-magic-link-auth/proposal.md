## Why

Magic link authentication partially works - it creates User and Session records but fails to create Account records in the database. This causes 401 errors in API endpoints that depend on complete user authentication state. Users can authenticate but subsequent API calls fail, breaking the core user experience.

## What Changes

- Fix magic link flow to ensure Account records are created alongside User and Session records
- Ensure PrismaAdapter properly handles Account creation for email provider authentication
- Verify all authentication flows create complete user state (User + Account + Session)
- Add validation to prevent partial authentication states

## Capabilities

### New Capabilities

None - this is a fix to existing functionality.

### Modified Capabilities

- `magic-link-auth`: Update requirements to ensure Account record creation during email authentication. The current spec assumes PrismaAdapter handles Account creation automatically, but this is not happening in practice. Need to add explicit requirement for Account record creation and validation.

## Impact

- **Database**: Account table will be properly populated for magic link users
- **Authentication Flow**: Magic link authentication will create complete user state
- **API Endpoints**: All authenticated API endpoints (`/api/user`, `/api/series`, `/api/reading-history`, etc.) will work correctly after magic link login
- **User Experience**: Users will no longer experience 401 errors after successful magic link authentication
- **Existing Users**: May need migration script to create missing Account records for users who authenticated via magic link
