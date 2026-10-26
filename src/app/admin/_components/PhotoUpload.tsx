"use client";

import { useActionState, useRef } from "react";
import { uploadPhotoAction, type FormState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import { UntilHydrated } from "./UntilHydrated";
import s from "../admin.module.css";

export function PhotoUpload() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const result = await uploadPhotoAction(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    {},
  );
  return (
    <form ref={formRef} action={action} className={s.uploadCard}>
      <UntilHydrated>
        <h2 className={s.priceTitle}>Добавить фото</h2>
        <div>
          <label htmlFor="photo" className={s.label}>
            Фото
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className={s.fileInput}
          />
        </div>
        <div>
          <label htmlFor="new-caption" className={s.label}>
            Подпись
          </label>
          <input
            id="new-caption"
            name="caption"
            maxLength={200}
            placeholder="Например: замена котла в частном доме"
            className={s.input}
          />
        </div>
        <div className={s.row}>
          <SubmitButton className={s.primary} pendingText="Загружаем…">
            Добавить фото
          </SubmitButton>
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
