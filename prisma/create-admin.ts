import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.log("❌ Por favor proporciona un email");
    console.log("Uso: npx tsx prisma/create-admin.ts tu@email.com");
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
    },
    create: {
      email,
      role: "ADMIN",
      showAdult: false,
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
