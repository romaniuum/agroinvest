"use client";

import type { ReactNode } from "react";
import { useHydrated } from "@/components/useHydrated";
import s from "../admin.module.css";

// Поля формы неактивны, пока страница не ожила: при оживлении React
// возвращает значения по умолчанию, и введённое раньше потерялось бы.
export function UntilHydrated({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  return (
    <fieldset disabled={!hydrated} className={s.untilHydrated}>
      {children}
    </fieldset>
  );
}
