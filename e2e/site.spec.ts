import { expect, test } from "@playwright/test";

test("главная: заголовок, телефон, блоки и сертификаты", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Ремонт и обслуживание газовых котлов/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /\+7 \(999\) 999-99-99/ }).first(),
  ).toHaveAttribute("href", "tel:+79999999999");
  for (const title of [
    "Чем мы поможем",
    "Как мы работаем",
    "Лицензии и сертификаты",
    "Оставьте заявку — мы перезвоним",
  ]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  const certificates = page.locator("#certificates-title ~ ul a");
  await expect(certificates).toHaveCount(9);
  await expect(certificates.first()).toHaveAttribute("target", "_blank");
});

test("на телефоне внизу закреплены «Позвонить» и «Заявка»", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const bar = page.getByRole("navigation", { name: "Быстрая связь" });
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link", { name: "Позвонить" })).toHaveAttribute(
    "href",
    "tel:+79999999999",
  );
  await page.mouse.wheel(0, 3000);
  await expect(bar).toBeInViewport();
});

test("политика, 404, robots и sitemap", async ({ page, request }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Политика конфиденциальности" }),
  ).toBeVisible();

  const missing = await page.goto("/net-takoy-stranicy");
  expect(missing?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Такой страницы нет" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "На главную" })).toBeVisible();

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/privacy",
  );
  expect((await request.get("/api/health")).ok()).toBe(true);
});
