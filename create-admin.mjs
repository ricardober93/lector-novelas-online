import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const email = "ricardotellez7@hotmail.com";

    const result = await pool.query(`
      INSERT INTO users (id, email, role, "showAdult", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        '${email}',
        'ADMIN',
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (email)
      DO UPDATE SET
        role = 'ADMIN',
        "updatedAt" = NOW()
      RETURNING id, email, role, "showAdult", "createdAt"
    `);

    const user = result.rows[0];

    console.log("✅ Usuario creado/actualizado exitosamente:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Show Adult: ${user.showAdult}`);
    console.log(`   Creado: ${user.createdAt}`);
    console.log("\n🎯 Ahora puedes:");
    console.log("   1. Ir a http://localhost:3000/login");
    console.log("   2. Ingresar: ricardotellez7@hotmail.com");
    console.log("   3. Recibir el magic link en tu email");
    console.log("   4. Click en el link y estarás logueado como ADMIN");
    console.log("\n🔧 También tendrás acceso a:");
    console.log("   - /admin (Panel de administración)");
    console.log("   - /creator (Panel de creador)");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
