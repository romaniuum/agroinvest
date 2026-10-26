import { defineConfig, devices } from "@playwright/test";
import { E2E } from "./e2e/env";

// Браузерные тесты: собранный сайт на порту 3100 с отдельной базой и папкой фото.
export default defineConfig({
  testDir: "e2e",
  // Общая база — тесты идут по очереди
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: E2E.baseURL,
    locale: "ru-RU",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${E2E.port}`,
    // Сервер стартует раньше globalSetup, поэтому ждём страницу без базы
    url: `${E2E.baseURL}/robots.txt`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: E2E.databaseUrl,
      UPLOAD_DIR: E2E.uploadDir,
      SITE_URL: E2E.baseURL,
      // Уведомления и капча в тестах выключены
      TELEGRAM_BOT_TOKEN: "",
      TELEGRAM_CHAT_ID: "",
      SMTP_HOST: "",
      SMARTCAPTCHA_SERVER_KEY: "",
      NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY: "",
    },
  },
});
