# Demo Images System

## ADDED Requirements

### Requirement: Demo Images Generation
The system SHALL provide a utility function to generate placeholder images for development and testing.

#### Scenario: Developer needs test data
- **WHEN** developer calls getDemoImages(count)
- **THEN** system returns array of placeholder image objects

#### Scenario: No real pages available
- **WHEN** chapter has no pages in database
- **THEN** system automatically uses demo images

### Requirement: Placeholder Image Consistency
All placeholder images MUST have consistent dimensions and aspect ratios typical of manga pages.

#### Scenario: Placeholder maintains aspect ratio
- **WHEN** placeholder image is generated
- **THEN** image has 800x1200 dimensions (3:4 aspect ratio)

#### Scenario: Placeholder includes page number
- **WHEN** placeholder image is displayed
- **THEN** image shows page number overlay

### Requirement: Development Mode Detection
The system SHALL only use demo images in development environment.

#### Scenario: Production environment
- **WHEN** NODE_ENV is "production"
- **THEN** demo images utility returns empty array

#### Scenario: Development environment
- **WHEN** NODE_ENV is "development"
- **THEN** demo images utility generates placeholder images

### Requirement: Configurable Demo Count
The system SHALL allow configuration of how many demo images to generate.

#### Scenario: Default count
- **WHEN** getDemoImages() called without parameter
- **THEN** system generates 20 images

#### Scenario: Custom count
- **WHEN** getDemoImages(10) called with parameter
- **THEN** system generates exactly 10 images
