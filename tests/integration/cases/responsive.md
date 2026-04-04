# Responsive Integration Cases

## Case: Desktop navigation shows inline actions

- **Given** the app is rendered at a desktop width
- **When** the header loads
- **Then** the navigation shows inline actions instead of a drawer

**Data**
- Viewport wider than the mobile breakpoint

**Checks**
- Desktop action area is visible
- Menu button is not the primary navigation path

## Case: Mobile navigation opens the drawer

- **Given** the app is rendered at a mobile width
- **When** the user taps the menu button
- **Then** the drawer opens
- **And** the drawer content is readable without clipping

**Data**
- Mobile viewport

**Checks**
- Drawer is visible
- Links are reachable
- No text is clipped offscreen

## Case: Drawer closes cleanly

- **Given** the mobile drawer is open
- **When** the user taps the overlay or close button
- **Then** the drawer closes
- **And** the page returns to the normal layout

**Data**
- Mobile viewport with drawer open

**Checks**
- Overlay disappears
- Body scroll state returns to normal

