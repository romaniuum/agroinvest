import path from "node:path";

const port = 3100;

// Отдельная база для тестов. Локально — в той же PostgreSQL из docker compose.
export const E2E = {
  port,
  baseURL: `http://localhost:${port}`,
  databaseUrl:
    process.env.E2E_DATABASE_URL ||
    "postgresql://agroinvest:agroinvest_dev@localhost:5432/agroinvest_e2e?schema=public",
  uploadDir: path.resolve("e2e/.tmp/uploads"),
  tmpDir: path.resolve("e2e/.tmp"),
  admin: { login: "e2e-admin", password: "e2e-password-123" },
};
