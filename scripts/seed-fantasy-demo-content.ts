import path from "node:path";
import { randomUUID } from "node:crypto";

import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no configurada");
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const publicBase = "/qa/fantasy-demo/chapter-1";

    await client.query("BEGIN");

    const creatorResult = await client.query<{
      id: string;
      email: string;
    }>(
      'select id, email from users where email = $1 limit 1',
      ["creator@test.com"],
    );

    const creator = creatorResult.rows[0];

    if (!creator) {
      throw new Error("No se encontro el usuario creator@test.com para sembrar el dataset QA");
    }

    const existingSeriesResult = await client.query<{ id: string }>(
      'select id from series where "creatorId" = $1 and title = $2 limit 1',
      [creator.id, "QA - La Llama del Umbral"],
    );

    const seriesId = existingSeriesResult.rows[0]?.id ?? randomUUID();

    if (existingSeriesResult.rows[0]) {
      await client.query(
        'update series set description = $1, type = $2, "isAdult" = $3, status = $4, "coverImage" = $5, "updatedAt" = now() where id = $6',
        [
          "Serie interna de QA para validar paginacion, upload y lectura con un capitulo de fantasia.",
          "MANGA",
          false,
          "ACTIVE",
          `${publicBase}/001.png`,
          seriesId,
        ],
      );
    } else {
      await client.query(
        'insert into series (id, "creatorId", title, description, type, "isAdult", status, "coverImage", "createdAt", "updatedAt") values ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())',
        [
          seriesId,
          creator.id,
          "QA - La Llama del Umbral",
          "Serie interna de QA para validar paginacion, upload y lectura con un capitulo de fantasia.",
          "MANGA",
          false,
          "ACTIVE",
          `${publicBase}/001.png`,
        ],
      );
    }

    const existingVolumeResult = await client.query<{ id: string }>(
      'select id from volumes where "seriesId" = $1 and number = $2 limit 1',
      [seriesId, 1],
    );

    const volumeId = existingVolumeResult.rows[0]?.id ?? randomUUID();

    if (existingVolumeResult.rows[0]) {
      await client.query(
        'update volumes set title = $1 where id = $2',
        ["Volumen 1 - QA", volumeId],
      );
    } else {
      await client.query(
        'insert into volumes (id, "seriesId", number, title, "createdAt") values ($1, $2, $3, $4, now())',
        [volumeId, seriesId, 1, "Volumen 1 - QA"],
      );
    }

    const existingChapterResult = await client.query<{ id: string }>(
      'select id from chapters where "volumeId" = $1 and number = $2 limit 1',
      [volumeId, 1],
    );

    const chapterId = existingChapterResult.rows[0]?.id ?? randomUUID();

    if (existingChapterResult.rows[0]) {
      await client.query(
        'update chapters set title = $1, "pageCount" = $2, status = $3, "updatedAt" = now() where id = $4',
        ["La noche del portal", 16, "APPROVED", chapterId],
      );
    } else {
      await client.query(
        'insert into chapters (id, "volumeId", number, title, "pageCount", status, "createdAt", "updatedAt") values ($1, $2, $3, $4, $5, $6, now(), now())',
        [chapterId, volumeId, 1, "La noche del portal", 16, "APPROVED"],
      );
    }

    await client.query('delete from pages where "chapterId" = $1', [chapterId]);

    for (let index = 0; index < 16; index += 1) {
      await client.query(
        'insert into pages (id, "chapterId", number, "imageUrl", width, height) values ($1, $2, $3, $4, $5, $6)',
        [
          randomUUID(),
          chapterId,
          index + 1,
          `${publicBase}/${String(index + 1).padStart(3, "0")}.png`,
          900,
          1400,
        ],
      );
    }

    await client.query("COMMIT");

    console.log(
      JSON.stringify(
        {
          creatorEmail: creator.email,
          seriesId,
          volumeId,
          chapterId,
          readUrl: `/read/${chapterId}`,
          creatorUrl: `/creator/chapters/${chapterId}`,
          localAssets: path.join("public", "qa", "fantasy-demo", "chapter-1"),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
