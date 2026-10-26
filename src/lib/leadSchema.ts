import { z } from "zod";
import { serviceOptions } from "./content";
import { isPhoneComplete, phoneDigits } from "./phone";

const serviceValues = serviceOptions.map((o) => o.value) as [
  (typeof serviceOptions)[number]["value"],
  ...(typeof serviceOptions)[number]["value"][],
];

// Общие правила проверки заявки: в браузере и на сервере.
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Напишите, как к вам обращаться")
    .max(100, "Имя слишком длинное"),
  phone: z
    .string()
    .refine(isPhoneComplete, "Введите номер полностью")
    .transform((value) => `+7${phoneDigits(value)}`),
  service: z.enum(serviceValues).default("OTHER"),
  consent: z.literal(true, "Без согласия мы не можем принять заявку"),
  captchaToken: z.string().max(5000).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadErrors = Partial<Record<"name" | "phone" | "consent", string>>;

export function leadErrors(error: z.ZodError): LeadErrors {
  const errors: LeadErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field === "name" || field === "phone" || field === "consent") {
      errors[field] ??= issue.message;
    }
  }
  return errors;
}
