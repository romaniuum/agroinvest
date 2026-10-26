import type { ServiceValue } from "@/lib/content";
import { leadErrors, leadSchema, type LeadErrors } from "@/lib/leadSchema";
import type { RateLimiter } from "@/lib/rateLimit";
import { callbackMessage } from "@/lib/workHours";

// Окно, в котором повторная заявка с тем же телефоном и услугой не создаёт новую.
export const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export type SavedLead = {
  id: number;
  name: string;
  phone: string;
  service: ServiceValue;
  createdAt: Date;
};

export type LeadDeps = {
  rateLimiter: RateLimiter;
  verifyCaptcha: (token: string | undefined, ip: string) => Promise<boolean>;
  findRecent: (
    phone: string,
    service: ServiceValue,
    since: Date,
  ) => Promise<SavedLead | null>;
  create: (data: {
    name: string;
    phone: string;
    service: ServiceValue;
    consentAt: Date;
  }) => Promise<SavedLead>;
};

export type SubmitResult =
  | { kind: "ok"; message: string; created: SavedLead | null }
  | { kind: "invalid"; errors: LeadErrors }
  | { kind: "rate_limited" }
  | { kind: "captcha_failed" };

export async function submitLead(
  raw: unknown,
  ctx: { ip: string; now: Date },
  deps: LeadDeps,
): Promise<SubmitResult> {
  const ok = (created: SavedLead | null): SubmitResult => ({
    kind: "ok",
    message: callbackMessage(ctx.now),
    created,
  });

  // Поле-ловушка: человек его не видит, бот заполняет. Отвечаем «успешно», ничего не сохраняем.
  const website = (raw as { website?: unknown } | null)?.website;
  if (typeof website === "string" && website.trim() !== "") return ok(null);

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return { kind: "invalid", errors: leadErrors(parsed.error) };
  }
  const input = parsed.data;

  if (!deps.rateLimiter.hit(ctx.ip, ctx.now.getTime())) {
    return { kind: "rate_limited" };
  }

  if (!(await deps.verifyCaptcha(input.captchaToken, ctx.ip))) {
    return { kind: "captcha_failed" };
  }

  const since = new Date(ctx.now.getTime() - DUPLICATE_WINDOW_MS);
  const duplicate = await deps.findRecent(input.phone, input.service, since);
  if (duplicate) return ok(null);

  const lead = await deps.create({
    name: input.name,
    phone: input.phone,
    service: input.service,
    consentAt: ctx.now,
  });
  return ok(lead);
}
