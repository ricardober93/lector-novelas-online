# Case Map

This directory groups precise integration cases by product flow.

## Shared case schema

Each case should answer:

- `Given`: what state/data must exist first
- `When`: what the user does
- `Then`: what the user should observe
- `Data`: the minimum seeded data or role needed
- `Checks`: the exact assertions that make the case testable

## Coverage map

- `auth.md` -> login, logout, route protection
- `home.md` -> landing page discovery and series entry points
- `reader.md` -> chapter loading and chapter navigation
- `creator.md` -> creator panel, volume creation, chapter upload entry points
- `admin.md` -> moderation queue and approval workflow
- `responsive.md` -> desktop nav and mobile drawer behavior

