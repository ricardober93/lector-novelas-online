# Responsive Integration Cases

## Case: Desktop navigation shows inline actions

- **GIVEN** the app is rendered at desktop width
- **WHEN** the header loads
- **THEN** the navigation shows the desktop action layout

## Case: Mobile navigation opens drawer

- **GIVEN** the app is rendered at mobile width
- **WHEN** the user taps the menu button
- **THEN** the drawer opens
- **AND** the drawer content is readable without clipping

## Case: Drawer closes cleanly

- **GIVEN** the mobile drawer is open
- **WHEN** the user taps the overlay or close button
- **THEN** the drawer closes
- **AND** the page returns to the normal layout

