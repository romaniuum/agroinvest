import Link from "next/link";
import { PhoneIcon } from "@/components/icons";
import { PublicShell } from "@/components/PublicShell";
import ui from "@/components/ui.module.css";
import s from "@/components/TextPage.module.css";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <PublicShell>
      <section className={s.page}>
        <div className={ui.container}>
          <h1 className={s.title}>Такой страницы нет</h1>
          <p className={s.text}>
            Возможно, ссылка устарела или в адресе ошибка. Позвоните нам —
            поможем:
          </p>
          <a href={site.phoneHref} className={s.phone}>
            <PhoneIcon size={28} />
            {site.phone}
          </a>
          <div className={s.buttons}>
            <Link href="/" className={ui.btnPrimary}>
              На главную
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
