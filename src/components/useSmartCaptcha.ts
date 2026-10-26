"use client";

import { useCallback, useRef } from "react";

type SmartCaptchaApi = {
  render: (
    container: HTMLElement,
    params: {
      sitekey: string;
      invisible: boolean;
      hl: string;
      callback: (token: string) => void;
    },
  ) => number;
  execute: (widgetId: number) => void;
  reset: (widgetId: number) => void;
};

declare global {
  interface Window {
    smartCaptcha?: SmartCaptchaApi;
    __onSmartCaptchaLoad?: () => void;
  }
}

const siteKey = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY;

let scriptPromise: Promise<SmartCaptchaApi> | undefined;

function loadScript(): Promise<SmartCaptchaApi> {
  scriptPromise ??= new Promise((resolve, reject) => {
    window.__onSmartCaptchaLoad = () => resolve(window.smartCaptcha!);
    const script = document.createElement("script");
    script.src =
      "https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=__onSmartCaptchaLoad";
    script.async = true;
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("SmartCaptcha не загрузилась"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Невидимая капча: без ключа ничего не делает, getToken возвращает undefined.
export function useSmartCaptcha() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<number | undefined>(undefined);
  const resolveRef = useRef<((token: string) => void) | undefined>(undefined);

  const prepare = useCallback(async () => {
    if (!siteKey || widgetRef.current !== undefined || !containerRef.current) {
      return;
    }
    const api = await loadScript();
    widgetRef.current ??= api.render(containerRef.current, {
      sitekey: siteKey,
      invisible: true,
      hl: "ru",
      callback: (token) => resolveRef.current?.(token),
    });
  }, []);

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!siteKey) return undefined;
    try {
      await prepare();
    } catch {
      // Сервер сам решит, пропускать ли заявку без токена.
      return undefined;
    }
    const api = window.smartCaptcha!;
    const widgetId = widgetRef.current!;
    return new Promise((resolve) => {
      // Если человек закрыл окно проверки, не держим кнопку заблокированной вечно.
      const timer = setTimeout(() => finish(undefined), 2 * 60 * 1000);
      function finish(token: string | undefined) {
        clearTimeout(timer);
        resolveRef.current = undefined;
        api.reset(widgetId);
        resolve(token);
      }
      resolveRef.current = finish;
      api.execute(widgetId);
    });
  }, [prepare]);

  return { containerRef, prepare, getToken };
}
