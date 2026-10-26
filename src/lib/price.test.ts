import { describe, expect, it } from "vitest";
import { formatPrice } from "./price";

describe("formatPrice", () => {
  it("форматирует сумму с пробелами и единицей", () => {
    expect(formatPrice(2500, "")).toBe("от 2 500 ₽");
    expect(formatPrice(12000, "/ мес")).toBe("от 12 000 ₽ / мес");
  });

  it("без цены предлагает позвонить", () => {
    expect(formatPrice(null, "")).toBe("Цену назовём по телефону");
  });
});
