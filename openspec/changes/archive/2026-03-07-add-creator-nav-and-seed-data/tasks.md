# Tasks: Add Creator Navigation and Seed Data

## Task 1: Fix Navigation Component for ADMIN Role
**Priority**: High
**Estimated Time**: 30 minutes

### Description
Update `Navigation.tsx` to show separate links for Creator and Admin sections based on user role.

### Acceptance Criteria
- [x] ADMIN users see both "Creator" and "Admin" links
- [x] CREATOR users see only "Creator" link (currently sees "Admin" link)
- [x] READER users see neither creator/admin links
- [x] Links have appropriate labels in Spanish
- [x] Links point to correct routes (`/creator`, `/admin`)

### Implementation Steps
1. Open `src/components/Navigation.tsx`
2. Locate the conditional rendering block (lines 26-33)
3. Replace with separate conditional blocks:
   ```typescript
   {(session.user?.role === "CREATOR" || session.user?.role === "ADMIN") && (
     <Link href="/creator" className="...">
       Panel Creator
     </Link>
   )}
   {session.user?.role === "ADMIN" && (
     <Link href="/admin" className="...">
       Administración
     </Link>
   )}
   ```
4. Test with all three roles

### Files to Modify
- `src/components/Navigation.tsx`

---

## Task 2: Create Seed Script Configuration
**Priority**: High
**Estimated Time**: 15 minutes

### Description
Add seed script configuration to `package.json` and create basic seed file structure.

### Acceptance Criteria
- [x] `package.json` has `"seed": "prisma db seed"` script
- [x] `package.json` has `prisma.seed` configuration
- [x] `prisma/seed.ts` file created with basic structure
- [x] Seed script runs with `npx prisma db seed`

### Implementation Steps
1. Add to `package.json`:
   ```json
   "prisma": {
     "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
   }
   ```
2. Install `ts-node` if not present: `npm install -D ts-node`
3. Create `prisma/seed.ts` with:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   import bcrypt from 'bcrypt';

   const prisma = new PrismaClient();

   async function main() {
     // Environment check
     if (process.env.NODE_ENV === 'production') {
       throw new Error('Cannot seed production database');
     }

     console.log('🌱 Starting seed...');
     // Seed logic here
   }

   main()
     .catch((e) => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```

### Files to Create/Modify
- `package.json` (modify)
- `prisma/seed.ts` (create)

---

## Task 3: Implement User Seeding
**Priority**: High
**Estimated Time**: 30 minutes

### Description
Create 3 test users with different roles (READER, CREATOR, ADMIN).

### Acceptance Criteria
- [x] User `reader@test.com` created with READER role
- [x] User `creator@test.com` created with CREATOR role
- [x] User `admin@test.com` created with ADMIN role
- [x] ~~All passwords hashed with bcrypt~~ (Not needed - magic link auth)
- [x] All users have `emailVerified` set to current date
- [x] Operation is idempotent (uses upsert)

### Implementation Steps
1. Define user data array
2. Hash password 'password123' for all users
3. Use `prisma.user.upsert` for each user:
   ```typescript
   const users = [
     { email: 'reader@test.com', role: 'READER', name: 'Reader User' },
     { email: 'creator@test.com', role: 'CREATOR', name: 'Creator User' },
     { email: 'admin@test.com', role: 'ADMIN', name: 'Admin User' }
   ];

   const password = await bcrypt.hash('password123', 10);

   for (const user of users) {
     await prisma.user.upsert({
       where: { email: user.email },
       update: {},
       create: {
         email: user.email,
         name: user.name,
         role: user.role,
         emailVerified: new Date(),
         // Password stored in Account table for NextAuth
       }
     });
   }
   ```
4. Create NextAuth Account entries for magic link auth

### Files to Modify
- `prisma/seed.ts`

---

## Task 4: Implement Series Seeding
**Priority**: High
**Estimated Time**: 45 minutes

### Description
Create 10 series with varied content types and statuses, all owned by creator user.

### Acceptance Criteria
- [x] 10 series created
- [x] All series owned by `creator@test.com`
- [x] Mix of content types: MANGA(4), COMIC(2), MANHUA(2), VISUAL_NOVEL(1), OTHER(1)
- [x] Mix of statuses: ACTIVE(7), DRAFT(3)
- [x] Each series has cover image URL from placeholder service
- [x] Each series has title and description in Spanish

### Implementation Steps
1. Get creator user ID from database
2. Define series data array:
   ```typescript
   const seriesData = [
     { title: 'Naruto Shippuden', type: 'MANGA', status: 'ACTIVE', isAdult: false },
     { title: 'One Piece', type: 'MANGA', status: 'ACTIVE', isAdult: false },
     { title: 'Attack on Titan', type: 'MANGA', status: 'ACTIVE', isAdult: false },
     { title: 'Demon Slayer', type: 'MANGA', status: 'ACTIVE', isAdult: false },
     { title: 'Spider-Man', type: 'COMIC', status: 'ACTIVE', isAdult: false },
     { title: 'Batman: Year One', type: 'COMIC', status: 'DRAFT', isAdult: false },
     { title: 'Solo Leveling', type: 'MANHUA', status: 'ACTIVE', isAdult: false },
     { title: 'Tower of God', type: 'MANHUA', status: 'ACTIVE', isAdult: false },
     { title: 'Doki Doki Literature Club', type: 'VISUAL_NOVEL', status: 'DRAFT', isAdult: false },
     { title: 'Webtoon Original', type: 'OTHER', status: 'DRAFT', isAdult: false }
   ];
   ```
3. Use `prisma.series.createMany` with data:
   ```typescript
   await prisma.series.createMany({
     data: seriesData.map((s, i) => ({
       ...s,
       creatorId,
       description: `Descripción de prueba para ${s.title}`,
       coverImage: `https://via.placeholder.com/400x600/1a1a1a/ffffff?text=${encodeURIComponent(s.title)}`
     }))
   });
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 5: Implement Volume Seeding
**Priority**: High
**Estimated Time**: 30 minutes

### Description
Create 20 volumes distributed across the 10 series (2 volumes per series).

### Acceptance Criteria
- [x] 20 volumes created
- [x] Each series has exactly 2 volumes
- [x] Volumes numbered 1-2 within each series
- [x] Volume titles in Spanish
- [x] Proper foreign key relationships

### Implementation Steps
1. Fetch all created series
2. For each series, create 2 volumes:
   ```typescript
   const series = await prisma.series.findMany({
     where: { creatorId }
   });

   for (const s of series) {
     await prisma.volume.createMany({
       data: [
         { seriesId: s.id, number: 1, title: `Volumen 1 de ${s.title}` },
         { seriesId: s.id, number: 2, title: `Volumen 2 de ${s.title}` }
       ]
     });
   }
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 6: Implement Chapter Seeding
**Priority**: High
**Estimated Time**: 45 minutes

### Description
Create 100 chapters (5 per volume) with mixed statuses.

### Acceptance Criteria
- [x] 100 chapters created
- [x] Each volume has exactly 5 chapters
- [x] Chapters numbered 1-5 within each volume
- [x] Status distribution: APPROVED(~60%), PENDING(~40%)
- [x] Each chapter has pageCount set to 15

### Implementation Steps
1. Fetch all volumes
2. For each volume, create 5 chapters:
   ```typescript
   const volumes = await prisma.volume.findMany();

   for (const volume of volumes) {
     const chapters = [];
     for (let i = 1; i <= 5; i++) {
       const status = Math.random() > 0.4 ? 'APPROVED' : 'PENDING';
       chapters.push({
         volumeId: volume.id,
         number: i,
         title: `Capítulo ${i}`,
         status,
         pageCount: 15
       });
     }
     await prisma.chapter.createMany({ data: chapters });
   }
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 7: Implement Page Seeding
**Priority**: High
**Estimated Time**: 1 hour

### Description
Create 1500 pages (15 per chapter) with placeholder images.

### Acceptance Criteria
- [x] 1500 pages created
- [x] Each chapter has exactly 15 pages
- [x] Pages numbered 1-15 within each chapter
- [x] Each page has placeholder image URL
- [x] Each page has width(800) and height(1200) dimensions
- [x] Uses batch insert for performance

### Implementation Steps
1. Fetch all chapters
2. For each chapter, create 15 pages:
   ```typescript
   const chapters = await prisma.chapter.findMany();

   for (const chapter of chapters) {
     const pages = [];
     for (let i = 1; i <= 15; i++) {
       pages.push({
         chapterId: chapter.id,
         number: i,
         imageUrl: `https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+${i}`,
         width: 800,
         height: 1200
       });
     }
     await prisma.page.createMany({ data: pages });
   }
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 8: Implement Moderation Seeding
**Priority**: Medium
**Estimated Time**: 30 minutes

### Description
Create moderation records for PENDING chapters.

### Acceptance Criteria
- [x] Moderation records created for all PENDING chapters
- [x] Status set to PENDING
- [x] No reviewer assigned (reviewerId null)
- [x] No notes initially

### Implementation Steps
1. Fetch all PENDING chapters
2. Create moderation records:
   ```typescript
   const pendingChapters = await prisma.chapter.findMany({
     where: { status: 'PENDING' }
   });

   await prisma.moderation.createMany({
     data: pendingChapters.map(chapter => ({
       chapterId: chapter.id,
       status: 'PENDING'
     }))
   });
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 9: Add Transaction Wrapping
**Priority**: High
**Estimated Time**: 30 minutes

### Description
Wrap all seed operations in a transaction for atomicity.

### Acceptance Criteria
- [x] All operations wrapped in `prisma.$transaction`
- [x] Transaction rolls back on any error
- [x] Proper error handling and logging
- [x] Connection cleanup on success/failure

### Implementation Steps
1. Refactor seed script to use transaction:
   ```typescript
   async function main() {
     await prisma.$transaction(async (tx) => {
       // All seeding operations here
       const users = await seedUsers(tx);
       const series = await seedSeries(tx, users);
       const volumes = await seedVolumes(tx, series);
       const chapters = await seedChapters(tx, volumes);
       const pages = await seedPages(tx, chapters);
       await seedModerations(tx, chapters);
     });
   }
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 10: Add Environment Guard
**Priority**: Critical
**Estimated Time**: 15 minutes

### Description
Add environment check to prevent seeding in production.

### Acceptance Criteria
- [x] Script exits with error if NODE_ENV === 'production'
- [x] Clear error message displayed
- [x] Process exits with code 1

### Implementation Steps
1. Add environment check at start of main():
   ```typescript
   async function main() {
     if (process.env.NODE_ENV === 'production') {
       console.error('❌ Cannot run seed in production environment');
       console.error('Current NODE_ENV:', process.env.NODE_ENV);
       process.exit(1);
     }
     // Rest of seeding logic
   }
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 11: Add Seed Script Logging
**Priority**: Medium
**Estimated Time**: 20 minutes

### Description
Add comprehensive logging throughout seed script for debugging and progress tracking.

### Acceptance Criteria
- [x] Progress messages for each seeding phase
- [x] Count summaries after each phase
- [x] Error messages with context
- [x] Total execution time displayed

### Implementation Steps
1. Add console.log statements:
   ```typescript
   console.log('🌱 Starting seed...');
   console.log('✅ Created 3 users');
   console.log('✅ Created 10 series');
   console.log('✅ Created 20 volumes');
   console.log('✅ Created 100 chapters');
   console.log('✅ Created 1500 pages');
   console.log('✅ Created moderation records');
   console.log('🎉 Seed completed successfully!');
   ```

### Files to Modify
- `prisma/seed.ts`

---

## Task 12: Test Navigation Changes
**Priority**: High
**Estimated Time**: 30 minutes

### Description
Manually test navigation with all three user roles.

### Acceptance Criteria
- [x] ADMIN sees: Perfil | Panel Creator | Administración | Cerrar sesión
- [x] CREATOR sees: Perfil | Panel Creator | Cerrar sesión
- [x] READER sees: Perfil | Cerrar sesión
- [x] Unauthenticated sees: Ingresar
- [x] All links navigate to correct pages
- [x] Middleware blocks unauthorized access

### Testing Steps
1. Log in as admin@test.com
2. Verify both Creator and Admin links visible
3. Click each link, verify access
4. Log in as creator@test.com
5. Verify only Creator link visible
6. Verify cannot access /admin routes
7. Log in as reader@test.com
8. Verify no creator/admin links visible
9. Verify cannot access /creator or /admin routes

---

## Task 13: Test Seed Script
**Priority**: High
**Estimated Time**: 30 minutes

### Description
Execute seed script and verify all data created correctly.

### Acceptance Criteria
- [x] `npx prisma db seed` executes without errors
- [x] All 3 users created with correct roles
- [x] All 10 series created with correct attributes
- [x] All 20 volumes created
- [x] All 100 chapters created with correct statuses
- [x] All 1500 pages created with placeholder images
- [x] Moderation records created for PENDING chapters
- [x] Foreign key relationships correct
- [x] Script is idempotent (can run multiple times)

### Testing Steps
1. Run `npx prisma db seed`
2. Check console output for success messages
3. Open Prisma Studio: `npx prisma studio`
4. Verify user count and roles
5. Verify series count and distribution
6. Verify volumes, chapters, pages counts
7. Verify image URLs are correct
8. Run seed again to verify idempotency

---

## Task 14: Document Seed Script Usage
**Priority**: Low
**Estimated Time**: 15 minutes

### Description
Update README.md with seed script instructions.

### Acceptance Criteria
- [x] README includes how to run seed script
- [x] Lists test user credentials
- [x] Notes about development-only execution
- [x] Warnings about data clearing

### Implementation Steps
1. Add section to README.md:
   ```markdown
   ## Seeding Test Data

   Run the seed script to populate database with test data:

   \`\`\`bash
   npx prisma db seed
   \`\`\`

   **Test Users:**
   - reader@test.com (password123) - READER role
   - creator@test.com (password123) - CREATOR role
   - admin@test.com (password123) - ADMIN role

   **Note:** Seed script only runs in development environment.
   ```

### Files to Modify
- `README.md`

---

## Task Summary

**Total Tasks**: 14
**Estimated Total Time**: ~5.5 hours

**Priority Breakdown**:
- Critical: 1 task (environment guard)
- High: 9 tasks (navigation, core seeding)
- Medium: 3 tasks (logging, documentation)
- Low: 1 task (README)

**Dependencies**:
- Tasks 2-11 should be completed sequentially (seed script)
- Task 1 can be done in parallel with seed script
- Tasks 12-13 depend on all previous tasks
- Task 14 can be done last

**Critical Path**: Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10 → Task 12 → Task 13
