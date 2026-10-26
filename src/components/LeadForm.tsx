"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { serviceOptions } from "@/lib/content";
import { validateLead, type LeadErrors } from "@/lib/leadSchema";
import { formatPhone } from "@/lib/phone";
import { site } from "@/lib/site";
import { useHydrated } from "./useHydrated";
import { useSmartCaptcha } from "./useSmartCaptcha";
import ui from "./ui.module.css";
import s from "./LeadForm.module.css";

// Поля не управляются React: значения живут в самих полях и читаются при отправке.
// Так не теряется то, что человек успел ввести, пока страница ещё загружалась.
export function LeadForm() {
  const [errors, setErrors] = useState<LeadErrors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [thanks, setThanks] = useState("");
  const hydrated = useHydrated();

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const {
    containerRef: captchaRef,
    prepare: prepareCaptcha,
    getToken: getCaptchaToken,
  } = useSmartCaptcha();

  // Номер, введённый до загрузки JavaScript, приводим к маске.
  useEffect(() => {
    const input = phoneRef.current;
    if (input?.value) input.value = formatPhone(input.value);
  }, []);

  function showErrors(next: LeadErrors) {
    setErrors(next);
    if (next.name) nameRef.current?.focus();
    else if (next.phone) phoneRef.current?.focus();
    else if (next.consent) consentRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setServerError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      service: (form.get("service") as string | null) ?? undefined,
      consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
    };
    const checked = validateLead(data);
    if (!checked.success) return showErrors(checked.errors);
    setErrors({});

    setSending(true);
    try {
      const captchaToken = await getCaptchaToken();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, captchaToken }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        errors?: LeadErrors;
      };
      if (res.ok) {
        setThanks(json.message ?? "");
        requestAnimationFrame(() => thanksRef.current?.focus());
        return;
      }
      if (json.errors && Object.keys(json.errors).length) {
        showErrors(json.errors);
      }
      setServerError(
        json.error ??
          `Не удалось отправить заявку. Позвоните нам: ${site.phone}`,
      );
    } catch {
      setServerError(
        `Нет связи с сайтом. Проверьте интернет или позвоните нам: ${site.phone}`,
      );
    } finally {
      setSending(false);
    }
  }

  if (thanks) {
    return (
      <div className={s.thanks} ref={thanksRef} tabIndex={-1} role="status">
        <p className={s.thanksTitle}>Спасибо, заявка отправлена!</p>
        <p>{thanks}</p>
      </div>
    );
  }

  return (
    // method="post": даже без JavaScript имя и телефон не попадут в адрес страницы
    <form
      method="post"
      className={s.form}
      onSubmit={handleSubmit}
      onFocusCapture={() => void prepareCaptcha().catch(() => {})}
      noValidate
    >
      <div className={s.field}>
        <label htmlFor="lead-name" className={s.label}>
          Ваше имя
        </label>
        <input
          ref={nameRef}
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={100}
          className={s.input}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
        />
        {errors.name && (
          <p id="lead-name-error" className={s.error}>
            {errors.name}
          </p>
        )}
      </div>

      <div className={s.field}>
        <label htmlFor="lead-phone" className={s.label}>
          Телефон
        </label>
        <input
          ref={phoneRef}
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          className={s.input}
          onChange={(e) => {
            e.currentTarget.value = formatPhone(e.currentTarget.value);
          }}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "lead-phone-error" : undefined}
        />
        {errors.phone && (
          <p id="lead-phone-error" className={s.error}>
            {errors.phone}
          </p>
        )}
      </div>

      <fieldset className={s.field}>
        <legend className={s.label}>Что нужно сделать</legend>
        <div className={s.options}>
          {serviceOptions.map((option) => (
            <label key={option.value} className={s.option}>
              <input type="radio" name="service" value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Поле-ловушка для ботов: человек его не видит и не заполняет */}
      <div className={s.trap} aria-hidden="true">
        <label htmlFor="lead-website">Сайт</label>
        <input
          id="lead-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={s.field}>
        <label className={s.consent}>
          <input
            ref={consentRef}
            type="checkbox"
            name="consent"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "lead-consent-error" : undefined}
          />
          <span>
            Согласен на обработку персональных данных по{" "}
            <Link href="/privacy" className={s.link}>
              политике конфиденциальности
            </Link>
          </span>
        </label>
        {errors.consent && (
          <p id="lead-consent-error" className={s.error}>
            {errors.consent}
          </p>
        )}
      </div>

      <div ref={captchaRef} />

      {serverError && (
        <p className={s.serverError} role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        className={`${ui.btnPrimary} ${s.submit}`}
        disabled={sending || !hydrated}
      >
        {sending ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
