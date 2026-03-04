## ADDED Requirements

### Requirement: Use Next.js Image component
The system SHALL use the Next.js Image component for all image rendering instead of native img tags.

#### Scenario: Replace img in reader
- **WHEN** rendering chapter pages in ChapterReader
- **THEN** the system SHALL use Next.js Image component with proper width and height attributes

#### Scenario: Replace img in series cards
- **WHEN** rendering series cover images
- **THEN** the system SHALL use Next.js Image component

#### Scenario: Fallback for missing dimensions
- **WHEN** image width or height is not available from API
- **THEN** the system SHALL provide sensible default dimensions

### Requirement: Lazy loading for images
The system SHALL implement lazy loading for images below the fold.

#### Scenario: Lazy load non-critical images
- **WHEN** rendering images that are not immediately visible
- **THEN** the system SHALL set loading="lazy" to defer loading until needed

#### Scenario: Immediate load for above-fold images
- **WHEN** rendering the first 3 images in a chapter
- **THEN** the system SHALL set loading="eager" and priority={true}

### Requirement: Priority hints for critical images
The system SHALL prioritize loading of critical images.

#### Scenario: First chapter page priority
- **WHEN** loading the first page of a chapter
- **THEN** the system SHALL set priority={true} to preload the image

#### Scenario: First series covers priority
- **WHEN** loading series grid on homepage
- **THEN** the system SHALL set priority={true} for the first 6 cover images

#### Scenario: Non-critical images deferred
- **WHEN** loading images beyond the initial viewport
- **THEN** the system SHALL set priority={false} to avoid bandwidth contention

### Requirement: Blur placeholder for smooth loading
The system SHALL display blur placeholders while images load.

#### Scenario: Show blur during load
- **WHEN** an image is loading
- **THEN** the system SHALL display a blur placeholder to prevent layout shift

#### Scenario: Fade in on load complete
- **WHEN** an image finishes loading
- **THEN** the system SHALL smoothly transition from blur to actual image

### Requirement: Error handling for failed images
The system SHALL handle image loading failures gracefully.

#### Scenario: Display fallback on error
- **WHEN** an image fails to load
- **THEN** the system SHALL display a fallback placeholder or error message

#### Scenario: Retry option on error
- **WHEN** an image fails to load
- **THEN** the system MAY provide a retry mechanism

### Requirement: Responsive images
The system SHALL serve appropriately sized images for different viewports.

#### Scenario: Mobile viewport optimization
- **WHEN** viewing on mobile device
- **THEN** the system SHALL serve smaller image sizes to reduce bandwidth

#### Scenario: Desktop viewport optimization
- **WHEN** viewing on desktop
- **THEN** the system SHALL serve appropriately sized images for the viewport

### Requirement: Alt text for accessibility
The system SHALL provide descriptive alt text for all images.

#### Scenario: Chapter page alt text
- **WHEN** rendering a chapter page image
- **THEN** the alt text SHALL describe the page (e.g., "Page 1 of Chapter 5")

#### Scenario: Series cover alt text
- **WHEN** rendering a series cover
- **THEN** the alt text SHALL include the series title
