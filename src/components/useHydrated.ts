"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false в HTML с сервера и до загрузки JavaScript, true — когда страница ожила.
// Кнопки отправки до этого неактивны: ранняя отправка формы теряется.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
