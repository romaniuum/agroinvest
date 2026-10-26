import { describe, expect, it } from "vitest";
import { formatPhone, isPhoneComplete, phoneDigits } from "./phone";

describe("formatPhone", () => {
  it("форматирует номер по мере ввода", () => {
    expect(formatPhone("9")).toBe("+7 (9");
    expect(formatPhone("+7 (9991")).toBe("+7 (999) 1");
    expect(formatPhone("+7 (999) 123-45-67")).toBe("+7 (999) 123-45-67");
  });

  it("первую 8 или 7 считает кодом страны", () => {
    expect(formatPhone("8")).toBe("");
    expect(formatPhone("89991234567")).toBe("+7 (999) 123-45-67");
    expect(formatPhone("+79991234567")).toBe("+7 (999) 123-45-67");
  });

  it("при стирании не оставляет лишних знаков", () => {
    expect(formatPhone("+7 (999) ")).toBe("+7 (999");
    expect(formatPhone("+7 (")).toBe("");
  });

  it("обрезает лишние цифры и игнорирует буквы", () => {
    expect(formatPhone("+7 (999) 123-45-678")).toBe("+7 (999) 123-45-67");
    expect(formatPhone("abc")).toBe("");
  });
});

describe("isPhoneComplete", () => {
  it("требует 10 цифр после кода страны", () => {
    expect(isPhoneComplete("+7 (999) 123-45-67")).toBe(true);
    expect(isPhoneComplete("+7 (999) 123-45-6")).toBe(false);
    expect(phoneDigits("+7 (999) 123-45-67")).toBe("9991234567");
  });
});
