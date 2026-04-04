# Home / Discovery Integration Cases

## Case: Home loads series list

- **GIVEN** the API returns published series
- **WHEN** the user opens `/`
- **THEN** the home page shows series cards
- **AND** the series list is not empty

## Case: Continue reading appears only with history

- **GIVEN** the signed-in user has reading history
- **WHEN** the user opens `/`
- **THEN** the continue-reading section is visible

## Case: Series card opens series detail

- **GIVEN** the home page shows at least one series card
- **WHEN** the user clicks a series card
- **THEN** the browser navigates to `/series/:id`

