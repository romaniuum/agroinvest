"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { serviceOptions } from "@/lib/content";
import { formatPhone, isPhoneComplete } from "@/lib/phone";
import { site } from "@/lib/site";
import ui from "./ui.module.css";
import s from "./LeadForm.module.css";

type Errors = { name?: string; phone?: string; consent?: string };

export function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Напишите, как к вам обращаться";
    if (!isPhoneComplete(phone)) next.phone = "Введите номер полностью";
    if (!consent) next.consent = "Без согласия мы не можем принять заявку";
    return next;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.phone) return phoneRef.current?.focus();
    if (next.consent) return consentRef.current?.focus();

    // Отправка на сервер появится на этапе 2.
    setSent(true);
    requestAnimationFrame(() => thanksRef.current?.focus());
  }

  if (sent) {
    return (
      <div className={s.thanks} ref={thanksRef} tabIndex={-1} role="status">
        <p className={s.thanksTitle}>Спасибо, заявка отправлена!</p>
        <p>Перезвоним в течение {site.callbackTime}.</p>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
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
            <label key={option} className={s.option}>
              <input
                type="radio"
                name="service"
                value={option}
                checked={service === option}
                onChange={() => setService(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

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

      <button type="submit" className={`${ui.btnPrimary} ${s.submit}`}>
        Отправить заявку
      </button>
    </form>
  );
}
