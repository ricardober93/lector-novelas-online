# Creator Integration Cases

## Case: Creator panel is accessible to creator

- **GIVEN** a user with the CREATOR role is signed in
- **WHEN** the user opens `/creator`
- **THEN** the panel loads without redirecting
- **AND** creator actions are visible

## Case: Creator detail page opens volume creation flow

- **GIVEN** a creator owns a series
- **WHEN** the creator opens `/creator/series/:id`
- **THEN** the series detail page is visible
- **AND** the creator can open the new-volume form

## Case: Creator chapter upload is reachable

- **GIVEN** a chapter exists under a creator-owned series
- **WHEN** the creator opens the chapter detail page
- **THEN** the upload flow for pages is visible

## Case: Non-creator is blocked from creator panel

- **GIVEN** a signed-in user does not have the CREATOR role
- **WHEN** the user opens `/creator`
- **THEN** the user is redirected away or denied access

