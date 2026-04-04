import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { normalizeEmail, resolveRoleForEmail } from "../src/lib/admin-user";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rawEmail = process.argv[2];

  if (!rawEmail) {
    console.log("❌ Por favor proporciona un email");
    console.log("Uso: npm run create:admin -- tu@email.com");
    process.exit(1);
  }

  const email = normalizeEmail(rawEmail);
  const role = resolveRoleForEmail(email, "ADMIN");

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role,
      emailVerified: true,
    },
    create: {
      email,
      role,
      showAdult: false,
      emailVerified: true,
    },
  });

  console.log("✅ Usuario creado/actualizado exitosamente:");
  console.log(`   Email: ${user.email}`);
  console.log(`   Rol: ${user.role}`);
  console.log(`   ID: ${user.id}`);
  console.log("\n🎯 Ahora puedes:");
  console.log("   1. Ir a http://localhost:3000/login");
  console.log("   2. Ingresar tu email");
  console.log("   3. Recibir el magic link");
  console.log("   4. Acceder como ADMIN");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
