import { formAnchor, site } from "@/lib/site";
import { FormIcon, PhoneIcon } from "./icons";
import s from "./MobileBar.module.css";

// Закреплённая панель внизу экрана, видна только на телефоне.
export function MobileBar() {
  return (
    <nav className={s.bar} aria-label="Быстрая связь">
      <a href={site.phoneHref} className={s.call}>
        <PhoneIcon size={22} />
        Позвонить
      </a>
      <a href={`/${formAnchor}`} className={s.request}>
        <FormIcon size={22} />
        Заявка
      </a>
    </nav>
  );
}
