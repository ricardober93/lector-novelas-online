# Creator Integration Cases

## Case: Creator panel is accessible to creator

- **Given** a user with the CREATOR role is signed in
- **When** the user opens `/creator`
- **Then** the creator dashboard loads
- **And** the user can see their series summary

**Data**
- Authenticated creator user

**Checks**
- The dashboard does not redirect to `/login`
- Series, volumes, and chapters metrics are visible

## Case: Creator detail page opens the new volume flow

- **Given** a creator owns a series
- **When** the creator opens `/creator/series/:id`
- **Then** the series detail page is visible
- **And** the creator can open the volume creation form

**Data**
- Creator-owned series with no volumes or with existing volumes

**Checks**
- Series title and metadata are visible
- `Agregar volumen` opens the form

## Case: Creator chapter upload is reachable

- **Given** a chapter exists under a creator-owned series
- **When** the creator opens the chapter detail page
- **Then** the upload flow for pages is visible

**Data**
- Chapter record with a valid volume/series chain

**Checks**
- The upload section is present
- The page reorder/upload controls are visible

## Case: Non-creator is blocked from creator panel

- **Given** a signed-in user does not have the CREATOR role
- **When** the user opens `/creator`
- **Then** the user is redirected away or denied access

**Data**
- Authenticated reader user

**Checks**
- No creator content is visible
- User does not remain on the creator dashboard

