import { describe, expect, it } from "vitest";
import { telegramText } from "./notify";

describe("telegramText", () => {
  it("содержит номер, услугу и ссылку, но не имя и телефон клиента", () => {
    process.env.SITE_URL = "https://example.ru/";
    const text = telegramText({
      id: 15,
      name: "Иван Петров",
      phone: "+79991234567",
      service: "REPAIR",
      createdAt: new Date(),
    });
    expect(text).toBe(
      "Новая заявка № 15 — Ремонт котла\nhttps://example.ru/admin/leads/15",
    );
    expect(text).not.toContain("Иван");
    expect(text).not.toContain("9991234567");
  });
});
