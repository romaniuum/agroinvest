import Link from "next/link";
import { site } from "@/lib/site";
import { ClockIcon, MapPinIcon, PhoneIcon } from "./icons";
import ui from "./ui.module.css";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`${ui.container} ${s.inner}`}>
        <div className={s.contacts}>
          <p className={s.name}>{site.name}</p>
          <a href={site.phoneHref} className={s.phone}>
            <PhoneIcon size={24} />
            {site.phone}
          </a>
          <p className={s.row}>
            <MapPinIcon size={24} />
            {site.address}
          </p>
          <p className={s.row}>
            <ClockIcon size={24} />
            {site.schedule}
          </p>
        </div>

        {/* Заглушка: Яндекс.Карта */}
        <div className={s.map}>Здесь будет карта</div>
      </div>

      <div className={`${ui.container} ${s.bottom}`}>
        <p>
          © {site.name}, {site.year}. {site.legal}
        </p>
        <Link href="/privacy" className={s.link}>
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  );
}
