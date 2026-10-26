import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "@/lib/rateLimit";
import { DUPLICATE_WINDOW_MS, submitLead, type LeadDeps } from "./leads";

const now = new Date("2026-10-26T12:00:00+03:00");
const ctx = { ip: "1.2.3.4", now };

const valid = {
  name: "Иван",
  phone: "+7 (999) 123-45-67",
  service: "REPAIR",
  consent: true,
};

function makeDeps(overrides: Partial<LeadDeps> = {}): LeadDeps {
  return {
    rateLimiter: createRateLimiter({ limit: 5, windowMs: 3600_000 }),
    verifyCaptcha: vi.fn(async () => true),
    findRecent: vi.fn(async () => null),
    create: vi.fn(async (data) => ({
      id: 15,
      name: data.name,
      phone: data.phone,
      service: data.service,
      createdAt: now,
    })),
    ...overrides,
  };
}

describe("submitLead", () => {
  it("сохраняет заявку со временем согласия и нормализованным телефоном", async () => {
    const deps = makeDeps();
    const result = await submitLead(valid, ctx, deps);
    expect(result.kind).toBe("ok");
    expect(deps.create).toHaveBeenCalledWith({
      name: "Иван",
      phone: "+79991234567",
      service: "REPAIR",
      consentAt: now,
    });
    if (result.kind === "ok") expect(result.created?.id).toBe(15);
  });

  it("не сохраняет и не проверяет капчу, если заполнено поле-ловушка", async () => {
    const deps = makeDeps();
    const result = await submitLead(
      { ...valid, website: "http://spam" },
      ctx,
      deps,
    );
    expect(result).toMatchObject({ kind: "ok", created: null });
    expect(deps.create).not.toHaveBeenCalled();
    expect(deps.verifyCaptcha).not.toHaveBeenCalled();
  });

  it("возвращает ошибки полей и ничего не сохраняет", async () => {
    const deps = makeDeps();
    const result = await submitLead({ ...valid, consent: false }, ctx, deps);
    expect(result).toEqual({
      kind: "invalid",
      errors: { consent: "Без согласия мы не можем принять заявку" },
    });
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("шестая заявка с одного IP за час отклоняется", async () => {
    const deps = makeDeps();
    for (let i = 0; i < 5; i++) {
      expect((await submitLead(valid, ctx, deps)).kind).toBe("ok");
    }
    expect((await submitLead(valid, ctx, deps)).kind).toBe("rate_limited");
    expect(
      (await submitLead(valid, { ...ctx, ip: "5.6.7.8" }, deps)).kind,
    ).toBe("ok");
  });

  it("отклоняет заявку, не прошедшую капчу", async () => {
    const deps = makeDeps({ verifyCaptcha: vi.fn(async () => false) });
    expect((await submitLead(valid, ctx, deps)).kind).toBe("captcha_failed");
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("повторная отправка в коротком окне не создаёт вторую заявку", async () => {
    const existing = {
      id: 14,
      name: "Иван",
      phone: "+79991234567",
      service: "REPAIR" as const,
      createdAt: now,
    };
    const deps = makeDeps({ findRecent: vi.fn(async () => existing) });
    const result = await submitLead(valid, ctx, deps);
    expect(result).toMatchObject({ kind: "ok", created: null });
    expect(deps.findRecent).toHaveBeenCalledWith(
      "+79991234567",
      "REPAIR",
      new Date(now.getTime() - DUPLICATE_WINDOW_MS),
    );
    expect(deps.create).not.toHaveBeenCalled();
  });
});
