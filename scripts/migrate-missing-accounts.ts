import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function migrateMissingAccounts() {
  console.log("Starting migration: Creating missing Account records...");
  console.log("Timestamp:", new Date().toISOString());

  try {
    const usersWithoutAccounts = await prisma.$queryRaw<Array<{ id: string; email: string }>>`
      SELECT u.id, u.email
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM accounts a WHERE a."userId" = u.id
      )
    `;

    console.log(`Found ${usersWithoutAccounts.length} users without Account records`);

    if (usersWithoutAccounts.length === 0) {
      console.log("No users need Account records. Migration complete.");
      return;
    }

    console.log("\nUsers to migrate:");
    usersWithoutAccounts.forEach((user, index) => {
      console.log(`  ${index + 1}. User ID: ${user.id}, Email: ${user.email}`);
    });

    const result = await prisma.$executeRaw`
      INSERT INTO accounts (id, "userId", type, provider, "providerAccountId")
      SELECT 
        gen_random_uuid(),
        u.id,
        'email',
        'email',
        u.email
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM accounts a WHERE a."userId" = u.id
      )
    `;

    console.log(`\n✓ Successfully created ${result} Account records`);

    const verification = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM accounts a WHERE a."userId" = u.id
      )
    `;

    const remainingCount = Number(verification[0].count);

    if (remainingCount === 0) {
      console.log("✓ Verification passed: All users now have Account records");
    } else {
      console.warn(`⚠ Warning: ${remainingCount} users still without Account records`);
    }

    console.log("\nMigration completed successfully!");
    console.log("Timestamp:", new Date().toISOString());
    
  } catch (error) {
    console.error("\n✗ Migration failed with error:");
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateMissingAccounts().catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
