import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});

async function testAuthFlow() {
  console.log('🔍 Auth Flow Diagnostic Tool\n');
  console.log('='.repeat(50));

  // 1. Verificar conexión a DB
  console.log('\n1. Testing database connection...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected\n');
  } catch (error) {
    console.log('❌ Database connection failed:', error);
    process.exit(1);
  }

  // 2. Verificar usuarios
  console.log('2. Checking users...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  if (users.length === 0) {
    console.log('⚠️  No users found in database');
  } else {
    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.role}) - ${user.createdAt.toLocaleDateString()}`);
    });
  }
  console.log('');

  // 3. Verificar tokens de verificación
  console.log('3. Checking verification tokens...');
  const tokens = await prisma.verification.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { expiresAt: 'desc' },
    take: 10,
  });

  if (tokens.length === 0) {
    console.log('⚠️  No valid verification tokens found');
  } else {
    console.log(`✅ Found ${tokens.length} valid tokens:`);
    tokens.forEach((token, i) => {
      const expiresIn = Math.floor((token.expiresAt.getTime() - Date.now()) / 1000 / 60);
      console.log(`   ${i + 1}. ${token.identifier} - expires in ${expiresIn} minutes`);
    });
  }
  console.log('');

  // 4. Verificar tokens expirados
  console.log('4. Checking expired tokens...');
  const expiredTokens = await prisma.verification.findMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  });

  if (expiredTokens.length > 0) {
    console.log(`⚠️  Found ${expiredTokens.length} expired tokens (should be cleaned up)`);
    console.log('   Run this to clean up:');
    console.log('   DELETE FROM verification_tokens WHERE expiresAt < NOW();');
  } else {
    console.log('✅ No expired tokens');
  }
  console.log('');

  // 5. Verificar sesiones activas
  console.log('5. Checking active sessions...');
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    take: 5,
    orderBy: { expiresAt: 'desc' },
  });

  if (sessions.length === 0) {
    console.log('⚠️  No active sessions found');
  } else {
    console.log(`✅ Found ${sessions.length} active sessions:`);
    sessions.forEach((session, i) => {
      const expiresIn = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000 / 60 / 60 / 24);
      console.log(`   ${i + 1}. ${session.user.email} - expires in ${expiresIn} days`);
    });
  }
  console.log('');

  // 6. Verificar cuentas
  console.log('6. Checking accounts...');
  const accounts = await prisma.account.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    take: 5,
  });

  if (accounts.length === 0) {
    console.log('⚠️  No accounts found (users haven\'t logged in yet)');
  } else {
    console.log(`✅ Found ${accounts.length} accounts`);
  }
  console.log('');

  // 7. Resumen
  console.log('='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Active Sessions: ${sessions.length}`);
  console.log(`   Valid Tokens: ${tokens.length}`);
  console.log(`   Expired Tokens: ${expiredTokens.length}`);
  console.log('='.repeat(50));
  console.log('');

  // 8. Recomendaciones
  if (expiredTokens.length > 0) {
    console.log('💡 RECOMMENDATION:');
    console.log('   You have expired tokens that should be cleaned up.');
    console.log('   Run: npx prisma studio');
    console.log('   Then delete expired tokens from verification_tokens table.');
    console.log('');
  }

  if (users.length === 0) {
    console.log('💡 NEXT STEPS:');
    console.log('   1. Go to http://localhost:3000/login');
    console.log('   2. Enter your email');
    console.log('   3. Click the magic link in your email');
    console.log('   4. Run this script again to see the created session');
    console.log('');
  }

  await prisma.$disconnect();
}

testAuthFlow()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
