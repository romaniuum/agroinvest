"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { serviceOptions, type ServiceValue } from "@/lib/content";
import { leadErrors, leadSchema, type LeadErrors } from "@/lib/leadSchema";
import { formatPhone } from "@/lib/phone";
import { site } from "@/lib/site";
import { useSmartCaptcha } from "./useSmartCaptcha";
import ui from "./ui.module.css";
import s from "./LeadForm.module.css";

export function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<ServiceValue | "">("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [thanks, setThanks] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const {
    containerRef: captchaRef,
    prepare: prepareCaptcha,
    getToken: getCaptchaToken,
  } = useSmartCaptcha();

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

    const data = {
      name,
      phone,
      service: service || undefined,
      consent,
      website: websiteRef.current?.value ?? "",
    };
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) return showErrors(leadErrors(parsed.error));
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
    <form
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
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
              <input
                type="radio"
                name="service"
                value={option.value}
                checked={service === option.value}
                onChange={() => setService(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Поле-ловушка для ботов: человек его не видит и не заполняет */}
      <div className={s.trap} aria-hidden="true">
        <label htmlFor="lead-website">Сайт</label>
        <input
          ref={websiteRef}
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
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
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
        disabled={sending}
        aria-disabled={sending}
      >
        {sending ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
