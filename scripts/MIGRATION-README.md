# Migration: Missing Account Records

## Purpose

This migration script creates Account records for existing users who authenticated via magic link before the Account creation fix was implemented.

## Background

NextAuth's PrismaAdapter doesn't automatically create Account records for email provider authentication. This caused users to have User and Session records but missing Account records, resulting in 401 errors in API endpoints.

## Prerequisites

- Node.js environment configured
- Database access (PostgreSQL)
- Prisma Client installed

## Execution Steps

### Development Environment

```bash
npx ts-node scripts/migrate-missing-accounts.ts
```

### Production Environment

```bash
# Run during low-traffic period
NODE_ENV=production npx ts-node scripts/migrate-missing-accounts.ts
```

## What the Script Does

1. **Identifies users without Account records**
   - Queries database for users with no corresponding Account record
   
2. **Creates Account records**
   - Uses SQL INSERT with idempotency check (WHERE NOT EXISTS)
   - Sets proper metadata: provider="email", type="email", providerAccountId=user email
   - Generates unique UUID for each Account record

3. **Verifies results**
   - Counts remaining users without Account records (should be 0)
   - Reports success or warnings

## Idempotency

The script is safe to run multiple times:
- Uses `WHERE NOT EXISTS` to prevent duplicate Account records
- Only creates records for users who don't have them
- Existing Account records are never modified

## Expected Output

```
Starting migration: Creating missing Account records...
Timestamp: 2024-XX-XX...

Found N users without Account records

Users to migrate:
  1. User ID: xxx, Email: user@example.com
  ...

✓ Successfully created N Account records
✓ Verification passed: All users now have Account records

Migration completed successfully!
Timestamp: 2024-XX-XX...
```

## Rollback

If needed, you can remove the created Account records:

```sql
DELETE FROM accounts
WHERE provider = 'email'
AND type = 'email';
```

**Note**: This is not recommended as Account records are required for proper authentication state.

## Monitoring

After running the migration:
1. Check authentication logs for Account creation messages
2. Monitor API endpoints for 401 error rates
3. Verify users can authenticate successfully
4. Query database to confirm all users have Account records

## Troubleshooting

### Script fails with database connection error
- Verify DATABASE_URL environment variable
- Check database is accessible
- Ensure Prisma Client is generated: `npx prisma generate`

### Script reports 0 users migrated
- This is expected if all users already have Account records
- Check database directly: `SELECT COUNT(*) FROM users u WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a."userId" = u.id);`

### Duplicate key errors
- Script should handle this automatically with idempotency check
- If persists, check database constraints: `SELECT * FROM pg_indexes WHERE tablename = 'accounts';`
