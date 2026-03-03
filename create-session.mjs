import { Pool } from "pg";
import { config } from "dotenv";
import crypto from "crypto";

config({ path: ".env.local" });

async function createSession() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const email = "ricardotellez7@hotmail.com";
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear o actualizar usuario
    const userResult = await pool.query(`
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
      RETURNING id
    `);

    const userId = userResult.rows[0].id;

    // Crear verification token
    await pool.query(`
      DELETE FROM verification_tokens WHERE identifier = '${email}'
    `);

    await pool.query(`
      INSERT INTO verification_tokens (identifier, token, expires)
      VALUES ('${email}', '${token}', '${expires.toISOString()}')
    `);

    console.log("✅ Token de verificación creado:");
    console.log(`\n🔗 Usa este link para loguearte:`);
    console.log(`http://localhost:3000/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${token}`);
    console.log("\n⏰ El link expira en 24 horas");
    console.log("\n💡 Copia y pega el link completo en tu navegador");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createSession();
