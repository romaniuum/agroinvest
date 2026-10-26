import { expect, test } from "@playwright/test";
import { newVisitor, sql, submitLead } from "./helpers";

test("пустая форма: понятные подсказки и курсор в первом поле", async ({
  browser,
}) => {
  const { page, context } = await newVisitor(browser);
  await page.goto("/");
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.getByText("Напишите, как к вам обращаться")).toBeVisible();
  await expect(page.getByText("Введите номер полностью")).toBeVisible();
  await expect(
    page.getByText("Без согласия мы не можем принять заявку"),
  ).toBeVisible();
  await expect(page.getByLabel("Ваше имя")).toBeFocused();
  await context.close();
});

test("маска телефона", async ({ browser }) => {
  const { page, context } = await newVisitor(browser);
  await page.goto("/");
  const phone = page.getByLabel("Телефон");
  await phone.pressSequentially("89161112233");
  await expect(phone).toHaveValue("+7 (916) 111-22-33");
  await context.close();
});

test("заявка сохраняется со временем согласия", async ({ browser }) => {
  const { page, context } = await newVisitor(browser);
  await submitLead(page, {
    name: "Иван Тестовый",
    phone: "9031234567",
    service: "Монтаж системы отопления",
  });
  const [lead] = await sql<{
    name: string;
    phone: string;
    service: string;
    status: string;
    consentAt: Date;
  }>(
    `SELECT name, phone, service, status, "consentAt" FROM "Lead" WHERE name = $1`,
    ["Иван Тестовый"],
  );
  expect(lead).toMatchObject({
    phone: "+79031234567",
    service: "INSTALL",
    status: "NEW",
  });
  expect(lead.consentAt).toBeTruthy();

  // Повторное нажатие через минуту не создаёт вторую заявку
  await submitLead(page, {
    name: "Иван Тестовый",
    phone: "9031234567",
    service: "Монтаж системы отопления",
  });
  expect(
    await sql(`SELECT id FROM "Lead" WHERE name = $1`, ["Иван Тестовый"]),
  ).toHaveLength(1);
  await context.close();
});

test("бот, заполнивший поле-ловушку, получает «успех», но ничего не сохраняется", async ({
  browser,
}) => {
  const { page, context } = await newVisitor(browser);
  await page.goto("/");
  await page
    .locator("#lead-website")
    .fill("http://spam.example", { force: true });
  await page.getByLabel("Ваше имя").fill("Бот Ловушкин");
  await page.getByLabel("Телефон").fill("9990000000");
  await page.getByLabel(/Согласен на обработку/).check();
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.getByText("Спасибо, заявка отправлена!")).toBeVisible();
  expect(
    await sql(`SELECT id FROM "Lead" WHERE name = $1`, ["Бот Ловушкин"]),
  ).toHaveLength(0);
  await context.close();
});

test("не больше 5 заявок с одного IP в час", async ({ browser }) => {
  const { page, context } = await newVisitor(browser);
  for (let i = 1; i <= 5; i++) {
    const res = await page.request.post("/api/leads", {
      data: {
        name: `Лимит ${i}`,
        phone: `+7 (999) 555-00-0${i}`,
        consent: true,
      },
    });
    expect(res.status()).toBe(200);
  }
  const sixth = await page.request.post("/api/leads", {
    data: { name: "Лимит 6", phone: "+7 (999) 555-00-06", consent: true },
  });
  expect(sixth.status()).toBe(429);
  await context.close();
});

test("медленный телефон: введённое до загрузки скриптов не теряется", async ({
  browser,
}) => {
  const { page, context } = await newVisitor(browser);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 300,
    downloadThroughput: 200 * 1024,
    uploadThroughput: 100 * 1024,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });

  await page.goto("/", { waitUntil: "commit" });
  const name = page.getByLabel("Ваше имя");
  await name.waitFor();
  const submit = page.getByRole("button", { name: "Отправить заявку" });
  // Пока скрипты не загрузились, кнопка неактивна, а вводить уже можно
  expect(await submit.isDisabled()).toBe(true);
  await name.pressSequentially("Пётр");
  await expect(submit).toBeEnabled({ timeout: 60_000 });
  await expect(name).toHaveValue("Пётр");
  await context.close();
});
