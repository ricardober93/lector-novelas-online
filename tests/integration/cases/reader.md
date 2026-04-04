# Reader Integration Cases

## Case: Chapter page loads successfully

- **Given** a valid chapter exists and the user is signed in
- **When** the user opens `/read/:id`
- **Then** the chapter pages render in the reader
- **And** the chapter navigation is visible below the reader

**Data**
- Authenticated user
- Chapter with at least one page

**Checks**
- Reader content is visible
- The chapter title/metadata is shown
- The page count matches the seeded chapter

## Case: Previous and next navigation work

- **Given** a chapter has both previous and next chapters
- **When** the user clicks previous or next
- **Then** the browser navigates to the expected chapter route

**Data**
- Three consecutive chapters in the same series

**Checks**
- Previous button points to the older chapter
- Next button points to the newer chapter
- The URL changes correctly after click

## Case: Series-completed state is shown

- **Given** the chapter is the last chapter in the series
- **When** the reader loads the chapter
- **Then** the next-chapter area shows the completed-series state

**Data**
- Last chapter of a series

**Checks**
- The next navigation is replaced by the completed state
- No broken next-link appears

## Case: Reader is blocked without session

- **Given** the user is not authenticated
- **When** the user tries to open a reader route
- **Then** the user is redirected away before reading content is shown

**Data**
- No session cookie

**Checks**
- User lands on `/login`
- No chapter pages are rendered

