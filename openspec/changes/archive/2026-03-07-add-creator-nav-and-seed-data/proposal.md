# Proposal: Add Creator Navigation Link and Seed Data

## Overview

Add navigation link to `/creator` section for ADMIN users and create database seed script with sample manga/comic data for development and testing purposes.

## Problem Statement

### 1. Navigation Issue
Currently, ADMIN users can only access `/admin` section through the navigation menu. However, ADMINs should also be able to access the `/creator` section to:
- Create and manage their own series
- Test the creator workflow
- Have full platform access

**Current behavior**: ADMIN sees only "Administración" link pointing to `/admin`
**Expected behavior**: ADMIN sees both "Creator" and "Admin" links

### 2. Missing Seed Data
The application lacks sample data for:
- Development testing
- UI/UX evaluation
- Demo purposes
- Onboarding new developers

## Proposed Solution

### 1. Fix Navigation (Security-Conscious)
- Update `Navigation.tsx` to show separate links for Creator and Admin sections
- ADMIN role: Shows both `/creator` and `/admin` links
- CREATOR role: Shows only `/creator` link
- READER role: No access to creator/admin sections

**Security considerations**:
- Client-side role checks in Navigation component
- Server-side protection via existing middleware
- No sensitive route exposure without proper authentication

### 2. Create Seed Script
Create `prisma/seed.ts` with:

**Users (3)**:
- `reader@test.com` - READER role
- `creator@test.com` - CREATOR role
- `admin@test.com` - ADMIN role

**Series (10)** - All created by `creator@test.com`:
- Mix of content types: MANGA, COMIC, MANHUA, VISUAL_NOVEL, OTHER
- Mix of statuses: ACTIVE, DRAFT
- Cover images via placeholder URLs

**Volumes (20 total)** - Distributed across 10 series:
- Some series with 1 volume
- Some series with 2-3 volumes
- Total: 20 volumes

**Chapters (100 total)** - 5 per volume:
- Status mix: PENDING, APPROVED
- Total: 100 chapters (20 volumes × 5 chapters)

**Pages (1500 total)** - 15 per chapter:
- Placeholder image URLs (via.placeholder.com)
- Realistic dimensions (800×1200px)
- Total: 1500 pages (100 chapters × 15 pages)

**Security considerations**:
- Use `.test` domain for emails (RFC 2606 compliant)
- Generate strong random passwords
- Hash passwords with bcrypt
- Only run in development environment
- Check for existing data before seeding

## Scope

### In Scope
- Navigation component update
- Seed script creation
- Prisma configuration for seed command
- Security validation for role-based access

### Out of Scope
- Production seed execution
- Real image uploads (using placeholders)
- Reading history seeding
- Moderation workflow seeding

## Success Criteria

1. ADMIN users see both "Creator" and "Admin" links in navigation
2. CREATOR users see only "Creator" link
3. READER users see neither creator/admin links
4. `npx prisma db seed` creates all test data successfully
5. Seed script is idempotent (can run multiple times)
6. Seed script only runs in development environment
7. All routes properly protected by middleware

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Seed script runs in production | Add environment check, require explicit flag |
| Existing data conflicts | Use upsert or clear confirmation |
| Placeholder images unavailable | Use reliable placeholder service (via.placeholder.com) |
| Role check bypassed on client | Middleware provides server-side protection |

## Estimated Effort

- Navigation fix: 30 minutes
- Seed script: 2-3 hours
- Testing: 30 minutes
- **Total**: ~3-4 hours

## Dependencies

- Existing Prisma schema (✓)
- Existing middleware protection (✓)
- NextAuth session with role (✓)
- Vercel Blob storage (not needed for placeholders)
