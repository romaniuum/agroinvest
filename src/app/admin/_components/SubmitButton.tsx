"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Кнопка блокируется на время отправки, чтобы не нажали дважды.
export function SubmitButton({
  children,
  pendingText = "Сохраняем…",
  className,
  name,
  value,
}: {
  children: ReactNode;
  pendingText?: string;
  className: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      name={name}
      value={value}
    >
      {pending ? pendingText : children}
    </button>
  );
}
