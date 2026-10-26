import { LoginForm } from "../_components/LoginForm";
import s from "../admin.module.css";

export default function LoginPage() {
  return (
    <main className={s.loginPage}>
      <LoginForm />
    </main>
  );
}
