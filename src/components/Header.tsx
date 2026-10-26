import Link from "next/link";
import { formAnchor, site } from "@/lib/site";
import { FlameIcon, PhoneIcon } from "./icons";
import ui from "./ui.module.css";
import s from "./Header.module.css";

export function Header() {
  return (
    <>
      <div className={s.topBar}>
        <div className={ui.container}>Режим работы: {site.schedule}</div>
      </div>
      <header className={s.header}>
        <div className={`${ui.container} ${s.inner}`}>
          <Link href="/" className={s.logo}>
            <span className={s.logoMark}>
              <FlameIcon size={28} />
            </span>
            <span>
              <span className={s.logoName}>{site.name}</span>
              <span className={s.logoTagline}>{site.tagline}</span>
            </span>
          </Link>

          <div className={s.actions}>
            <a href={site.phoneHref} className={s.phone}>
              <PhoneIcon size={24} />
              {site.phone}
            </a>
            <a href={`/${formAnchor}`} className={`${ui.btnPrimary} ${s.cta}`}>
              Вызвать мастера
            </a>
            <a
              href={site.phoneHref}
              className={s.callRound}
              aria-label={`Позвонить: ${site.phone}`}
            >
              <PhoneIcon size={26} />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
