import { expect, type Browser, type Page } from "@playwright/test";
import pg from "pg";
import { E2E } from "./env";

// Прямой запрос к тестовой базе — проверить, что сохранилось.
export async function sql<T = Record<string, unknown>>(
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  const client = new pg.Client({ connectionString: E2E.databaseUrl });
  await client.connect();
  try {
    return (await client.query(query, params)).rows as T[];
  } finally {
    await client.end();
  }
}

// Каждый «посетитель» со своим IP: ограничения частоты считаются по IP.
let ipCounter = 0;
export async function newVisitor(
  browser: Browser,
  viewport?: { width: number; height: number },
) {
  ipCounter += 1;
  const context = await browser.newContext({
    baseURL: E2E.baseURL,
    locale: "ru-RU",
    viewport,
    extraHTTPHeaders: {
      "x-forwarded-for": `10.20.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`,
    },
  });
  return { context, page: await context.newPage() };
}

export async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Логин").fill(E2E.admin.login);
  await page.getByLabel("Пароль").fill(E2E.admin.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByRole("heading", { name: "Заявки" })).toBeVisible();
}

export async function submitLead(
  page: Page,
  { name, phone, service }: { name: string; phone: string; service?: string },
) {
  await page.goto("/");
  await page.getByLabel("Ваше имя").fill(name);
  await page.getByLabel("Телефон").fill(phone);
  if (service) await page.getByLabel(service).check();
  await page.getByLabel(/Согласен на обработку/).check();
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.getByText("Спасибо, заявка отправлена!")).toBeVisible();
}
