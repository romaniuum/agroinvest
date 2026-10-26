"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import { SubmitButton } from "./SubmitButton";
import s from "../admin.module.css";

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className={s.loginCard}>
      <h1 className={s.title}>Вход в админку</h1>
      <div>
        <label htmlFor="login" className={s.label}>
          Логин
        </label>
        <input
          id="login"
          name="login"
          autoComplete="username"
          autoCapitalize="none"
          defaultValue={state.login}
          key={state.login}
          required
          className={s.input}
        />
      </div>
      <div>
        <label htmlFor="password" className={s.label}>
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={s.input}
        />
      </div>
      {state.error && (
        <p className={s.errorMessage} role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton className={s.primary} pendingText="Входим…">
        Войти
      </SubmitButton>
    </form>
  );
}
