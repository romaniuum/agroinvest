import { describe, expect, it } from "vitest";
import { validateLead } from "./leadSchema";

const valid = {
  name: "  Иван ",
  phone: "+7 (999) 123-45-67",
  service: "REPAIR",
  consent: true,
};

describe("validateLead", () => {
  it("принимает правильную заявку и приводит телефон к +7XXXXXXXXXX", () => {
    const result = validateLead(valid);
    expect(result).toEqual({
      success: true,
      data: {
        name: "Иван",
        phone: "+79991234567",
        service: "REPAIR",
        consent: true,
        captchaToken: undefined,
      },
    });
  });

  it("без услуги ставит «Другое»", () => {
    const result = validateLead({ ...valid, service: undefined });
    expect(result.success && result.data.service).toBe("OTHER");
  });

  it("отклоняет неизвестную услугу и чужие типы", () => {
    expect(validateLead({ ...valid, service: "HACK" }).success).toBe(false);
    expect(validateLead({ ...valid, consent: "true" }).success).toBe(false);
    expect(validateLead({ ...valid, captchaToken: 42 }).success).toBe(false);
    expect(validateLead(null).success).toBe(false);
  });

  it("слишком длинное имя", () => {
    const result = validateLead({ ...valid, name: "я".repeat(101) });
    expect(result).toEqual({
      success: false,
      errors: { name: "Имя слишком длинное" },
    });
  });

  it("возвращает понятные ошибки по каждому полю", () => {
    expect(
      validateLead({ name: "   ", phone: "+7 (999", consent: false }),
    ).toEqual({
      success: false,
      errors: {
        name: "Напишите, как к вам обращаться",
        phone: "Введите номер полностью",
        consent: "Без согласия мы не можем принять заявку",
      },
    });
  });
});
