import { formAnchor, site } from "@/lib/site";
import { CheckIcon, ImageIcon, PhoneIcon } from "./icons";
import ui from "./ui.module.css";
import s from "./Hero.module.css";

const benefits = [
  "Выезд в день обращения",
  "Гарантия на работы",
  "Допуск к газовому оборудованию",
];

export function Hero() {
  return (
    <section className={s.hero}>
      <div className={`${ui.container} ${s.inner}`}>
        <div className={s.text}>
          <h1 className={s.title}>
            Ремонт и обслуживание газовых котлов в {site.city}
          </h1>
          <p className={s.lead}>
            Чиним котлы, монтируем отопление под ключ и берём котельные на
            обслуживание. Цену называем до начала работ.
          </p>
          <div className={s.buttons}>
            <a href={site.phoneHref} className={ui.btnPrimary}>
              <PhoneIcon size={22} />
              Позвонить мастеру
            </a>
            <a href={formAnchor} className={ui.btnOutline}>
              Оставить заявку
            </a>
          </div>
          <ul className={s.benefits}>
            {benefits.map((item) => (
              <li key={item}>
                <CheckIcon size={24} className={s.check} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Заглушка: фото мастера у котла */}
        <div className={s.photo} role="img" aria-label="Мастер у котла">
          <ImageIcon size={48} />
          <span>Фото мастера у котла</span>
        </div>
      </div>
    </section>
  );
}
