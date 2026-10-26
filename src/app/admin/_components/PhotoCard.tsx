"use client";

import { useActionState } from "react";
import { photoUrl } from "@/lib/photos";
import {
  deletePhotoAction,
  saveCaptionAction,
  type FormState,
} from "../actions";
import { SubmitButton } from "./SubmitButton";
import s from "../admin.module.css";

export function PhotoCard({
  id,
  fileName,
  caption,
  onSite,
}: {
  id: number;
  fileName: string;
  caption: string;
  onSite: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    saveCaptionAction,
    {},
  );
  return (
    <li className={onSite ? s.photoCardOnSite : s.photoCard}>
      {/* eslint-disable-next-line @next/next/no-img-element -- превью уже уменьшено */}
      <img
        src={photoUrl(fileName, 800)}
        alt={caption || "Фото без подписи"}
        width={800}
        height={600}
        loading="lazy"
        className={s.photoPreview}
      />
      {onSite && <p className={s.okMessage}>Показывается на сайте</p>}
      <form action={action} className={s.detailRow}>
        <input type="hidden" name="id" value={id} />
        <label htmlFor={`caption-${id}`} className={s.label}>
          Подпись
        </label>
        <input
          id={`caption-${id}`}
          name="caption"
          defaultValue={caption}
          maxLength={200}
          className={s.input}
        />
        <SubmitButton className={s.secondary}>Сохранить подпись</SubmitButton>
        <p role="status" className={state.error ? s.errorMessage : s.okMessage}>
          {state.error ?? state.message}
        </p>
      </form>
      <form
        action={deletePhotoAction}
        onSubmit={(e) => {
          if (!confirm("Удалить это фото? Вернуть его будет нельзя.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <SubmitButton className={s.danger} pendingText="Удаляем…">
          Удалить
        </SubmitButton>
      </form>
    </li>
  );
}
