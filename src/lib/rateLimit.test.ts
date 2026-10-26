import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("пропускает не больше limit запросов за окно", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 1000 });
    for (let i = 0; i < 5; i++) expect(limiter.hit("1.1.1.1", 0)).toBe(true);
    expect(limiter.hit("1.1.1.1", 500)).toBe(false);
    expect(limiter.hit("2.2.2.2", 500)).toBe(true);
  });

  it("снова пропускает, когда окно прошло", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.hit("ip", 0)).toBe(true);
    expect(limiter.hit("ip", 999)).toBe(false);
    expect(limiter.hit("ip", 1000)).toBe(true);
  });
});

describe("blocked и reset", () => {
  it("blocked не засчитывает попытку, reset снимает блокировку", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(limiter.blocked("ip", 0)).toBe(false);
    limiter.hit("ip", 0);
    limiter.hit("ip", 0);
    expect(limiter.blocked("ip", 10)).toBe(true);
    expect(limiter.blocked("ip", 1000)).toBe(false);
    limiter.reset("ip");
    expect(limiter.blocked("ip", 10)).toBe(false);
  });
});
