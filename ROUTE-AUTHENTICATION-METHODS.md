# Route Authentication Methods

## Protected by Middleware (UI Routes)

| Route Pattern | Protection Method | Authentication Check |
|---------------|------------------|---------------------|
| `/creator/*` | Middleware | Session cookie check |
| `/read/*` | Middleware | Session cookie check |
| `/admin/*` | Middleware + Role Check | Session cookie + ADMIN role |

## Protected by API Handler (API Routes)

| Route | Methods | Protection Method | Authentication Check |
|-------|---------|------------------|---------------------|
| `/api/admin/moderation` | GET, POST | getServerSession() | Session + ADMIN role |
| `/api/admin/moderation/[id]` | PUT | getServerSession() | Session + ADMIN role |
| `/api/chapters` | POST | getServerSession() | Session required |
| `/api/chapters/[id]` | PUT, DELETE | getServerSession() | Session required |
| `/api/chapters/[id]/upload` | POST | getServerSession() | Session required |
| `/api/pages` | POST | getServerSession() | Session required |
| `/api/pages/[id]` | PUT, DELETE | getServerSession() | Session required |
| `/api/pages/reorder` | POST | getServerSession() | Session required |
| `/api/reading-history` | GET, POST | getServerSession() | Session required |
| `/api/series/[id]` | PUT, DELETE | getServerSession() | Session required |
| `/api/user` | GET, PUT | getServerSession() | Session required |
| `/api/volumes` | POST | getServerSession() | Session required |
| `/api/volumes/[id]` | PUT, DELETE | getServerSession() | Session required |

## Public Routes (No Authentication Required)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/chapters/navigation` | GET | Chapter navigation (public) |
| `/api/series` | GET | Series listing (public) |
| `/api/auth/[...nextauth]` | * | NextAuth endpoints |

## Authentication Strategy

- **Session Strategy**: Database (not JWT)
- **Session Cookie**: `next-auth.session-token` contains session ID
- **Session Lookup**: Database via Prisma
- **Middleware Limitation**: Cannot use `getServerSession()` (requires full NextAuth init)
- **Solution**: Middleware protects UI routes only, API routes self-protect
