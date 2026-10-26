import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";
import { E2E } from "./env";

// Перед тестами: чистая база (миграции + администратор), чистая папка фото, тестовые картинки.
export default async function globalSetup() {
  const url = new URL(E2E.databaseUrl);
  const dbName = url.pathname.slice(1);
  if (!dbName.endsWith("_e2e")) {
    throw new Error(
      `Тесты пересоздают базу, имя должно оканчиваться на _e2e: ${dbName}`,
    );
  }

  const admin = new URL(url);
  admin.pathname = "/postgres";
  admin.search = "";
  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  await client.query(`CREATE DATABASE "${dbName}"`);
  await client.end();

  const env = { ...process.env, DATABASE_URL: E2E.databaseUrl };
  execSync("npx prisma migrate deploy", { env, stdio: "ignore" });
  execSync("npx tsx scripts/create-admin.ts", {
    env,
    input: `${E2E.admin.login}\n${E2E.admin.password}\n${E2E.admin.password}\n`,
    stdio: ["pipe", "ignore", "inherit"],
  });

  await rm(E2E.tmpDir, { recursive: true, force: true });
  await mkdir(E2E.uploadDir, { recursive: true });

  // Фото «с телефона»: 3000×2250, около 3 МБ
  const w = 3000;
  const h = 2250;
  const noise = Buffer.alloc(w * h * 3);
  for (let i = 0; i < noise.length; i++) noise[i] = (i * 2654435761) >>> 24;
  await sharp(noise, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 85 })
    .toFile(path.join(E2E.tmpDir, "photo.jpg"));
  await writeFile(path.join(E2E.tmpDir, "not-a-photo.jpg"), "это не картинка");
}
