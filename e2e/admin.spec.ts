import path from "node:path";
import { expect, test } from "@playwright/test";
import { E2E } from "./env";
import { login, newVisitor, sql, submitLead } from "./helpers";

const photo = path.join(E2E.tmpDir, "photo.jpg");
const notPhoto = path.join(E2E.tmpDir, "not-a-photo.jpg");

test.describe.configure({ mode: "serial" });

test("без входа админка не открывается, неверный пароль не пускает", async ({
  browser,
}) => {
  const { page, context } = await newVisitor(browser);
  await page.goto("/admin/prices");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Логин").fill(E2E.admin.login);
  await page.getByLabel("Пароль").fill("неправильный-пароль");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText(
    "Неверный логин или пароль",
  );
  // Логин остаётся в поле
  await expect(page.getByLabel("Логин")).toHaveValue(E2E.admin.login);
  await context.close();
});

test("заявка: в работу, заметка, готово", async ({ browser }) => {
  const visitor = await newVisitor(browser);
  await submitLead(visitor.page, {
    name: "Мария Заявкина",
    phone: "9122223344",
    service: "Ремонт котла",
  });
  await visitor.context.close();

  const { page, context } = await newVisitor(browser);
  await login(page);
  const cookie = (await context.cookies()).find((c) => c.name === "agro_admin");
  expect(cookie).toMatchObject({
    httpOnly: true,
    sameSite: "Lax",
    path: "/admin",
  });

  const card = page.getByRole("listitem").filter({ hasText: "Мария Заявкина" });
  await expect(card).toContainText("+7 (912) 222-33-44");
  await expect(card.getByRole("link", { name: "Позвонить" })).toHaveAttribute(
    "href",
    "tel:+79122223344",
  );
  await card.getByRole("button", { name: "В работу" }).click();
  await expect(card).toBeHidden();

  await page.getByRole("link", { name: /В работе · \d+/ }).click();
  await page.getByText("Мария Заявкина").click();
  await expect(
    page.getByRole("heading", { name: /Заявка № \d+/ }),
  ).toBeVisible();
  await page.getByLabel("Заметка").fill("Перезвонить после 18:00");
  await page.getByRole("button", { name: "Сохранить заметку" }).click();
  await expect(page.getByText("Заметка сохранена")).toBeVisible();
  await expect(page.getByLabel("Заметка")).toHaveValue(
    "Перезвонить после 18:00",
  );
  await page.getByRole("button", { name: "Готово" }).click();
  // В статусе «Готово» кнопка «Готово» пропадает
  await expect(page.getByRole("button", { name: "Готово" })).toBeHidden();

  const [lead] = await sql<{ status: string; note: string }>(
    `SELECT status, note FROM "Lead" WHERE name = $1`,
    ["Мария Заявкина"],
  );
  expect(lead).toEqual({ status: "DONE", note: "Перезвонить после 18:00" });
  await context.close();
});

test("цены: проверка ввода и сразу на сайте", async ({ browser }) => {
  const { page, context } = await newVisitor(browser);
  await login(page);
  await page.getByRole("link", { name: "Цены" }).click();
  await page.getByLabel("Ремонт котла").fill("дорого");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByText("Цена — это целое число рублей")).toBeVisible();

  await page.getByLabel("Ремонт котла").fill("2500");
  await page.getByLabel("Монтаж системы отопления").fill("45 000");
  await page.getByLabel("Обслуживание котельной").fill("12000");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(
    page.getByText("Сохранено, цены на сайте обновлены"),
  ).toBeVisible();
  await expect(page.getByLabel("Монтаж системы отопления")).toHaveValue(
    "45000",
  );

  await page.goto("/");
  await expect(page.getByText("от 2 500 ₽", { exact: true })).toBeVisible();
  await expect(page.getByText("от 45 000 ₽", { exact: true })).toBeVisible();
  await expect(
    page.getByText("от 12 000 ₽ / мес", { exact: true }),
  ).toBeVisible();
  await context.close();
});

test("фото работ: загрузка, подпись, удаление и сразу новая загрузка", async ({
  browser,
}) => {
  const { page, context } = await newVisitor(browser);
  await login(page);
  await page.getByRole("link", { name: "Фото работ" }).click();
  const photos = page.locator("main ul > li");

  await page.getByLabel("Фото", { exact: true }).setInputFiles(notPhoto);
  await page.getByRole("button", { name: "Добавить фото" }).click();
  await expect(page.getByText("Это не похоже на фотографию")).toBeVisible();

  await page.getByLabel("Фото", { exact: true }).setInputFiles(photo);
  await page.getByLabel("Подпись").first().fill("Замена котла");
  await page.getByRole("button", { name: "Добавить фото" }).click();
  await expect(photos).toHaveCount(1, { timeout: 30_000 });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Наши работы" }),
  ).toBeVisible();
  await expect(page.locator("figcaption")).toHaveText(["Замена котла"]);
  const src = await page.locator("figure img").getAttribute("src");
  expect((await page.request.get(src!)).headers()["content-type"]).toBe(
    "image/webp",
  );

  await page.goto("/admin/photos");
  await photos.first().getByLabel("Подпись").fill("Монтаж котла");
  await page.getByRole("button", { name: "Сохранить подпись" }).click();
  await expect(page.getByText("Подпись сохранена")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("figcaption")).toHaveText(["Монтаж котла"]);

  // Удаление с подтверждением: сначала «Отмена», потом «ОК»
  await page.goto("/admin/photos");
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(photos).toHaveCount(1);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(photos).toHaveCount(0);

  // Сразу после удаления — новая загрузка (здесь однажды падала страница)
  await page.getByLabel("Фото", { exact: true }).setInputFiles(photo);
  await page.getByRole("button", { name: "Добавить фото" }).click();
  await expect(photos).toHaveCount(1, { timeout: 30_000 });
  await expect(page.getByText("Фото добавлено")).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Наши работы" }),
  ).toBeVisible();
  await context.close();
});

test("выход и защита от перебора паролей", async ({ browser }) => {
  const { page, context } = await newVisitor(browser);
  await login(page);
  await page.getByRole("button", { name: "Выйти" }).first().click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);

  for (let i = 1; i <= 5; i++) {
    await page.getByLabel("Логин").fill(E2E.admin.login);
    await page.getByLabel("Пароль").fill(`wrong-${i}`);
    // Ждём ответа сервера на каждую попытку
    await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST"),
      page.getByRole("button", { name: "Войти" }).click(),
    ]);
    await expect(page.getByRole("button", { name: "Войти" })).toBeEnabled();
  }
  await expect(page.locator("form [role=alert]")).toHaveText(
    "Слишком много попыток. Подождите 15 минут.",
  );
  await page.getByLabel("Пароль").fill(E2E.admin.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText(
    "Слишком много попыток. Подождите 15 минут.",
  );
  await expect(page).toHaveURL(/\/admin\/login$/);
  await context.close();
});
