# Reader Integration Cases

## Case: Chapter page loads successfully

- **GIVEN** a valid chapter exists and the user is signed in
- **WHEN** the user opens `/read/:id`
- **THEN** the chapter pages render in the reader
- **AND** the chapter title and navigation are visible

## Case: Previous and next navigation work

- **GIVEN** a chapter has both previous and next chapters
- **WHEN** the user clicks previous or next
- **THEN** the browser navigates to the expected chapter route

## Case: Series-completed state is shown

- **GIVEN** the chapter is the last chapter in the series
- **WHEN** the reader loads the chapter
- **THEN** the next-chapter area shows the completed-series state

## Case: Reader is blocked without session

- **GIVEN** the user is not authenticated
- **WHEN** the user tries to open a reader route
- **THEN** the user is redirected away before reading content is shown

