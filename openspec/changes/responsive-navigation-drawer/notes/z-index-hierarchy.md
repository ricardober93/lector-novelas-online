# Navigation Z-Index Hierarchy

## Z-Index Values Used

- **Drawer Overlay**: `z-40` (bg-black/50)
- **Drawer Container**: `z-50` (navigation drawer)
- **Panel Dropdown Menu**: `z-50` (dropdown menu)

## Z-Index Hierarchy

1. Base content: `z-0` (default)
2. Drawer overlay: `z-40`
3. Drawer and Dropdowns: `z-50`

## Potential Conflicts

If other components use overlays (modals, tooltips, etc.), ensure they use:
- Tooltips/Popovers: `z-30` or lower
- Modals: `z-50` or higher
- Toasts/Notifications: `z-60` or higher

## Notes

- The drawer overlay is at `z-40` to sit below the drawer itself (`z-50`)
- The panel dropdown is at `z-50` to appear above other content
- No z-index conflicts detected in current implementation
- Test with other overlay components if issues arise
