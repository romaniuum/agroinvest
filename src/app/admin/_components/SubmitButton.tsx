"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useHydrated } from "@/components/useHydrated";

// Кнопка блокируется на время отправки, чтобы не нажали дважды,
// и до загрузки JavaScript — иначе действие не выполнится.
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
  const hydrated = useHydrated();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending || !hydrated}
      name={name}
      value={value}
    >
      {pending ? pendingText : children}
    </button>
  );
}
