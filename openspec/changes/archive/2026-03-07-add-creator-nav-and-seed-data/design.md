# Design: Add Creator Navigation and Seed Data

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Navigation.tsx                                          │  │
│  │  ├─ Role-based conditional rendering                    │  │
│  │  ├─ Links: Perfil | Creator | Admin | Cerrar sesión     │  │
│  │  └─ Session from NextAuth (useSession)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  middleware.ts                                           │  │
│  │  ├─ /creator/* → Requires CREATOR or ADMIN role         │  │
│  │  ├─ /admin/* → Requires ADMIN role                      │  │
│  │  └─ Server-side session validation                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  prisma/seed.ts                                          │  │
│  │  ├─ Environment guard (NODE_ENV !== 'production')       │  │
│  │  ├─ Transactional seeding                               │  │
│  │  └─ Idempotent operations (upsert)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component 1: Navigation Security Model

### Current State (Problem)
```typescript
// Navigation.tsx:26-33
{(session.user?.role === "CREATOR" || session.user?.role === "ADMIN") && (
  <Link href={session.user?.role === "ADMIN" ? "/admin" : "/creator"}>
    Administración
  </Link>
)}
```

**Issues**:
- ADMIN only sees `/admin`, not `/creator`
- Single link labeled "Administración" is confusing

### Proposed State (Solution)
```typescript
// Separate links for clarity
{session.user?.role === "CREATOR" && (
  <Link href="/creator">Creator</Link>
)}

{(session.user?.role === "CREATOR" || session.user?.role === "ADMIN") && (
  <Link href="/admin">Admin</Link>
)}
```

**Security Layers**:

```
┌────────────────────────────────────────────────────┐
│  Layer 1: Client (Navigation.tsx)                  │
│  ├─ Hides links user can't access                  │
│  └─ UX improvement, NOT security boundary          │
├────────────────────────────────────────────────────┤
│  Layer 2: Middleware (middleware.ts)               │
│  ├─ Server-side role validation                    │
│  ├─ JWT/session token verification                 │
│  └─ TRUE security boundary                         │
├────────────────────────────────────────────────────┤
│  Layer 3: API Routes                               │
│  ├─ getServerSession() validation                  │
│  └─ Role checks before database operations         │
└────────────────────────────────────────────────────┘
```

## Component 2: Seed Script Design

### Execution Flow

```
┌──────────────────────────────────────────────────────────┐
│  prisma/seed.ts                                          │
├──────────────────────────────────────────────────────────┤
│  1. Environment Check                                    │
│     └─ if (process.env.NODE_ENV === 'production')       │
│         throw new Error('Cannot seed in production')     │
│                                                          │
│  2. Clean Existing Data (Optional, with confirmation)   │
│     └─ Transaction: Delete Pages → Chapters → Volumes   │
│                       → Series → Users                   │
│                                                          │
│  3. Seed Users (UPSERT)                                  │
│     ├─ reader@test.com  → READER                        │
│     ├─ creator@test.com → CREATOR                       │
│     └─ admin@test.com   → ADMIN                         │
│                                                          │
│  4. Seed Series (10)                                     │
│     ├─ creatorId: creator.test.com                      │
│     ├─ Types: MANGA(4), COMIC(2), MANHUA(2),            │
│     │         VISUAL_NOVEL(1), OTHER(1)                 │
│     ├─ Status: ACTIVE(7), DRAFT(3)                      │
│     └─ Cover: via.placeholder.com/400x600               │
│                                                          │
│  5. Seed Volumes (20)                                    │
│     ├─ Distribution: 2 per series                       │
│     └─ Numbered 1-2 per series                          │
│                                                          │
│  6. Seed Chapters (100)                                  │
│     ├─ 5 per volume                                      │
│     ├─ Status: APPROVED(60), PENDING(40)                │
│     └─ Page counts: 15 each                              │
│                                                          │
│  7. Seed Pages (1500)                                    │
│     ├─ 15 per chapter                                    │
│     ├─ Images: via.placeholder.com/800x1200             │
│     └─ Dimensions: 800x1200 (standard manga page)       │
│                                                          │
│  8. Create Moderations (for PENDING chapters)           │
│     └─ Link to chapters with PENDING status             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Data Distribution

```
Series (10)
├─ Series 1-4: MANGA (2 volumes each = 8 volumes)
├─ Series 5-6: COMIC (2 volumes each = 4 volumes)
├─ Series 7-8: MANHUA (2 volumes each = 4 volumes)
├─ Series 9: VISUAL_NOVEL (2 volumes)
└─ Series 10: OTHER (2 volumes)

Total Volumes: 20

Each Volume:
└─ 5 Chapters
   └─ 15 Pages each

Total Chapters: 20 × 5 = 100
Total Pages: 100 × 15 = 1,500
```

### Security Considerations for Seed

**1. Environment Protection**
```typescript
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot run seed in production environment');
  process.exit(1);
}
```

**2. Password Security**
```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash('password123', 10);
// Use in user creation
```

**3. Idempotent Operations**
```typescript
// Use upsert instead of create
await prisma.user.upsert({
  where: { email: 'reader@test.com' },
  update: {},
  create: { email: 'reader@test.com', ... }
});
```

**4. Transactional Integrity**
```typescript
await prisma.$transaction(async (tx) => {
  // All operations succeed or all fail
  await tx.user.createMany(...);
  await tx.series.createMany(...);
  // ...
});
```

**5. No Real Data**
- Test emails only (@test.com)
- Placeholder images only
- No API keys or secrets

## Database Schema Usage

```
User (creator)
   │
   └─▶ Series (10)
         │
         └─▶ Volume (20)
               │
               └─▶ Chapter (100)
                     │
                     ├─▶ Page (1500)
                     │
                     └─▶ Moderation (40 - for PENDING chapters)
```

## Placeholder Image URLs

```
Cover Images (400x600):
https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Manga+1

Page Images (800x1200):
https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+1
```

**Why via.placeholder.com?**
- Reliable service
- No rate limits for small batches
- Customizable with text
- Fast response times

## File Structure

```
prisma/
├─ schema.prisma (existing)
└─ seed.ts (NEW)

src/
└─ components/
   └─ Navigation.tsx (MODIFY)
```

## Testing Strategy

### Manual Testing Checklist

**Navigation**:
- [ ] ADMIN user sees: Perfil | Creator | Admin | Cerrar sesión
- [ ] CREATOR user sees: Perfil | Admin | Cerrar sesión
- [ ] READER user sees: Perfil | Cerrar sesión
- [ ] Unauthenticated user sees: Ingresar

**Seed Script**:
- [ ] `npx prisma db seed` runs successfully
- [ ] All 3 users created with correct roles
- [ ] 10 series created under creator@test.com
- [ ] 20 volumes distributed across series
- [ ] 100 chapters created (5 per volume)
- [ ] 1500 pages created (15 per chapter)
- [ ] Moderation records for PENDING chapters
- [ ] Seed fails in production environment

**Security**:
- [ ] CREATOR cannot access /admin routes
- [ ] READER cannot access /creator routes
- [ ] Middleware blocks unauthorized access
- [ ] API routes validate sessions

## Performance Considerations

**Seed Script Optimization**:
- Use `createMany` for bulk inserts
- Batch operations in transactions
- Total expected time: ~10-15 seconds for 1,500+ records

**Navigation Component**:
- No performance impact
- Role checks are synchronous
- Session already loaded by NextAuth

## Rollback Plan

If seed causes issues:
```bash
npx prisma migrate reset
# This will:
# 1. Drop all data
# 2. Reset database
# 3. Re-run migrations
```

If navigation causes issues:
- Revert Navigation.tsx changes
- Clear browser cache
- Re-authenticate users
