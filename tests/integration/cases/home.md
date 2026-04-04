# Home / Discovery Integration Cases

## Case: Home loads published series

- **Given** the API returns at least one published series
- **When** the user opens `/`
- **Then** the home page shows the series grid
- **And** each visible series card is clickable

**Data**
- At least one `ACTIVE` series with volumes and chapters

**Checks**
- Page title and hero render
- Series cards are visible
- Each card links to `/series/:id`

## Case: Continue reading appears only when history exists

- **Given** the signed-in user has reading history
- **When** the user opens `/`
- **Then** the continue-reading section is visible

**Data**
- Authenticated user with at least one reading-history record

**Checks**
- The continue-reading section is rendered
- Progress percentage is visible
- The card links to `/read/:chapterId`

## Case: Series card opens the series detail page

- **Given** the home page shows at least one series card
- **When** the user clicks the card
- **Then** the browser navigates to `/series/:id`

**Data**
- One visible series card

**Checks**
- Route changes to the detail page
- Series title is visible on the destination page

