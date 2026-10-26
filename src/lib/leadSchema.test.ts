import { describe, expect, it } from "vitest";
import { leadErrors, leadSchema } from "./leadSchema";

const valid = {
  name: "  Иван ",
  phone: "+7 (999) 123-45-67",
  service: "REPAIR",
  consent: true,
};

describe("leadSchema", () => {
  it("принимает правильную заявку и приводит телефон к +7XXXXXXXXXX", () => {
    const result = leadSchema.parse(valid);
    expect(result).toMatchObject({
      name: "Иван",
      phone: "+79991234567",
      service: "REPAIR",
    });
  });

  it("без услуги ставит «Другое»", () => {
    expect(leadSchema.parse({ ...valid, service: undefined }).service).toBe(
      "OTHER",
    );
  });

  it("отклоняет неизвестную услугу", () => {
    expect(leadSchema.safeParse({ ...valid, service: "HACK" }).success).toBe(
      false,
    );
  });

  it("возвращает понятные ошибки по каждому полю", () => {
    const result = leadSchema.safeParse({
      name: "   ",
      phone: "+7 (999",
      consent: false,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(leadErrors(result.error)).toEqual({
      name: "Напишите, как к вам обращаться",
      phone: "Введите номер полностью",
      consent: "Без согласия мы не можем принять заявку",
    });
  });
});
