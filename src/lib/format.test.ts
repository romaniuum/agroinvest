import { describe, expect, it } from "vitest";
import { formatLeadTime } from "./format";

const msk = (iso: string) => new Date(`${iso}+03:00`);
const now = msk("2026-10-26T15:00:00");

describe("formatLeadTime", () => {
  it("сегодня и вчера по московскому времени", () => {
    expect(formatLeadTime(msk("2026-10-26T00:10:00"), now)).toBe(
      "Сегодня, 00:10",
    );
    expect(formatLeadTime(msk("2026-10-25T23:50:00"), now)).toBe(
      "Вчера, 23:50",
    );
  });

  it("более ранние даты — числом и месяцем", () => {
    expect(formatLeadTime(msk("2026-10-20T09:05:00"), now)).toBe(
      "20 октября, 09:05",
    );
  });
});
