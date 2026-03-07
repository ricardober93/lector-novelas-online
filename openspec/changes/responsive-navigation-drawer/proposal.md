## Why

The current Navigation component is not optimized for mobile and tablet devices, displaying all navigation items inline regardless of screen size. This creates a poor user experience on smaller screens with potential overflow issues. Additionally, the separate "Panel Creator" and "Administración" links could be better organized through a unified dropdown menu to reduce visual clutter and improve navigation hierarchy.

## What Changes

- Replace the current horizontal-only navigation layout with a responsive design that adapts to screen size
- Implement a drawer/hamburger menu for mobile and tablet devices (small and medium screens)
- Implement a horizontal navigation bar with dropdown menus for desktop screens
- Create a unified "Panel" dropdown that conditionally displays "Creator Panel" or "Admin Panel" based on user role permissions
- Maintain existing functionality (profile, sign out, login links) across all screen sizes
- Preserve role-based access control for admin and creator panels
- Ensure smooth transitions between responsive states

## Capabilities

### New Capabilities
- `responsive-navigation`: Responsive navigation system with drawer for mobile/tablet and horizontal menu for desktop
- `role-based-panel-dropdown`: Unified dropdown menu that displays admin or creator panel options based on user role

### Modified Capabilities
None - this is a UI enhancement that doesn't change existing requirements

## Impact

**Affected Components:**
- `src/components/Navigation.tsx` - Complete refactor for responsive behavior

**Affected Code:**
- Navigation component structure and styling
- Potentially new sub-components for drawer, dropdown menu, and navigation items

**Dependencies:**
- No new external dependencies required
- Will leverage existing Tailwind CSS utilities for responsive design
- May use existing Lucide icons for hamburger/close icons

**User Experience:**
- Improved mobile/tablet navigation experience
- Cleaner desktop navigation with dropdown organization
- Consistent behavior across all device sizes
