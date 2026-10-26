"use client";

import { useActionState } from "react";
import { savePricesAction, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import s from "../admin.module.css";

type Row = {
  slug: string;
  title: string;
  priceFrom: number | null;
  unit: string;
};

export function PricesForm({ rows }: { rows: Row[] }) {
  const [state, action] = useActionState<FormState, FormData>(
    savePricesAction,
    {},
  );
  return (
    <form action={action} className={s.card}>
      {rows.map((row) => (
        <div key={row.slug} className={s.priceRow}>
          <label htmlFor={`price-${row.slug}`} className={s.priceTitle}>
            {row.title}
          </label>
          <div className={s.priceField}>
            <span>от</span>
            <input
              id={`price-${row.slug}`}
              name={`price-${row.slug}`}
              inputMode="numeric"
              defaultValue={row.priceFrom ?? ""}
              className={s.priceInput}
              aria-describedby="prices-hint"
            />
            <span>₽{row.unit && ` ${row.unit}`}</span>
          </div>
        </div>
      ))}
      <p id="prices-hint" className={s.hintAfter}>
        Пустое поле — на сайте будет «Цену назовём по телефону».
      </p>
      <div className={s.row}>
        <SubmitButton className={s.primary}>Сохранить</SubmitButton>
        <p role="status" className={state.error ? s.errorMessage : s.okMessage}>
          {state.error ?? state.message}
        </p>
      </div>
    </form>
  );
}
