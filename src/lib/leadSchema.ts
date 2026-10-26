import { serviceOptions, type ServiceValue } from "./content";
import { isPhoneComplete, phoneDigits } from "./phone";

// Общие правила проверки заявки: в браузере и на сервере.
// Без библиотек — чтобы не тянуть лишний JavaScript на телефон посетителя.

export type LeadInput = {
  name: string;
  phone: string; // +79991234567
  service: ServiceValue;
  consent: true;
  captchaToken?: string;
};

export type LeadErrors = Partial<
  Record<"name" | "phone" | "consent" | "service" | "request", string>
>;

export type LeadValidation =
  { success: true; data: LeadInput } | { success: false; errors: LeadErrors };

const serviceValues: readonly string[] = serviceOptions.map((o) => o.value);

export function validateLead(raw: unknown): LeadValidation {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const errors: LeadErrors = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) errors.name = "Напишите, как к вам обращаться";
  else if (name.length > 100) errors.name = "Имя слишком длинное";

  const phone = typeof input.phone === "string" ? input.phone : "";
  if (!isPhoneComplete(phone)) errors.phone = "Введите номер полностью";

  const service = input.service ?? "OTHER";
  if (typeof service !== "string" || !serviceValues.includes(service)) {
    errors.service = "Выберите услугу из списка";
  }

  if (input.consent !== true) {
    errors.consent = "Без согласия мы не можем принять заявку";
  }

  const captchaToken = input.captchaToken;
  if (
    captchaToken !== undefined &&
    (typeof captchaToken !== "string" || captchaToken.length > 5000)
  ) {
    errors.request = "Неверный запрос";
  }

  if (Object.keys(errors).length) return { success: false, errors };
  return {
    success: true,
    data: {
      name,
      phone: `+7${phoneDigits(phone)}`,
      service: service as ServiceValue,
      consent: true,
      captchaToken: captchaToken as string | undefined,
    },
  };
}
