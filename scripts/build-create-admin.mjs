// Собирает scripts/create-admin.ts в один файл для Docker-образа.
// Prisma, pg и argon2 берутся из node_modules сайта (они там уже есть).
import { build } from "esbuild";

await build({
  entryPoints: ["scripts/create-admin.ts"],
  outfile: "dist/create-admin.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  external: ["@prisma/client", "pg", "@node-rs/argon2"],
  // CommonJS-зависимости (dotenv) вызывают require — даём его в ESM
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
});
