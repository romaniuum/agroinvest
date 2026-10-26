import { describe, expect, it } from "vitest";
import { site } from "./site";
import { callbackMessage, isWorkingTime } from "./workHours";

// Время в UTC; Москва = UTC+3. 2026-10-26 — понедельник.
const msk = (iso: string) => new Date(`${iso}+03:00`);

describe("рабочее время (пн–сб, 9–18, Москва)", () => {
  it("в рабочее время обещает быстрый звонок", () => {
    expect(isWorkingTime(msk("2026-10-26T12:00:00"))).toBe(true);
    expect(callbackMessage(msk("2026-10-26T12:00:00"))).toBe(
      `Перезвоним в течение ${site.callbackTime}.`,
    );
  });

  it("рано утром — сегодня с 9:00", () => {
    expect(callbackMessage(msk("2026-10-26T07:30:00"))).toBe(
      "Перезвоним сегодня с 9:00.",
    );
  });

  it("вечером — завтра с 9:00", () => {
    expect(isWorkingTime(msk("2026-10-26T18:00:00"))).toBe(false);
    expect(callbackMessage(msk("2026-10-26T20:00:00"))).toBe(
      "Перезвоним завтра с 9:00.",
    );
  });

  it("в субботу вечером и в воскресенье — в понедельник", () => {
    expect(callbackMessage(msk("2026-10-31T19:00:00"))).toBe(
      "Перезвоним в понедельник с 9:00.",
    );
    expect(callbackMessage(msk("2026-11-01T12:00:00"))).toBe(
      "Перезвоним завтра с 9:00.",
    );
  });
});
