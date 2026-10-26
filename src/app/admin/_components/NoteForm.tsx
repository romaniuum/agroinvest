"use client";

import { useActionState } from "react";
import { saveNoteAction, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { UntilHydrated } from "./UntilHydrated";
import s from "../admin.module.css";

export function NoteForm({ id, note }: { id: number; note: string }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveNoteAction,
    {},
  );
  return (
    <form action={action} className={s.detailRow}>
      <UntilHydrated>
        <input type="hidden" name="id" value={id} />
        <label htmlFor="note" className={s.label}>
          Заметка
        </label>
        <textarea
          id="note"
          name="note"
          defaultValue={note}
          maxLength={2000}
          className={s.textarea}
          placeholder="Например: перезвонить вечером, адрес, модель котла"
        />
        <div className={s.row}>
          <SubmitButton className={s.secondary}>Сохранить заметку</SubmitButton>
          <p
            role="status"
            className={state.error ? s.errorMessage : s.okMessage}
          >
            {state.error ?? state.message}
          </p>
        </div>
      </UntilHydrated>
    </form>
  );
}
