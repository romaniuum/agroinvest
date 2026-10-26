import type { ComponentType } from "react";
import { services, type Service } from "@/lib/content";
import { formAnchor } from "@/lib/site";
import { BuildingIcon, CheckIcon, RadiatorIcon, WrenchIcon } from "./icons";
import ui from "./ui.module.css";
import s from "./Services.module.css";

const icons: Record<Service["slug"], ComponentType<{ size?: number }>> = {
  repair: WrenchIcon,
  install: RadiatorIcon,
  maintenance: BuildingIcon,
};

export function Services() {
  return (
    <section className={ui.section} aria-labelledby="services-title">
      <div className={ui.container}>
        <h2 id="services-title" className={ui.h2}>
          Чем мы поможем
        </h2>
        <div className={s.grid}>
          {services.map((service) => {
            const Icon = icons[service.slug];
            return (
              <article key={service.slug} className={s.card}>
                <span className={s.icon}>
                  <Icon size={32} />
                </span>
                <h3 className={s.title}>{service.title}</h3>
                <ul className={s.points}>
                  {service.points.map((point) => (
                    <li key={point}>
                      <CheckIcon size={22} className={s.check} />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className={s.price}>
                  от {service.priceFrom} ₽{service.unit && ` ${service.unit}`}
                </p>
                <a href={formAnchor} className={ui.btnPrimary}>
                  {service.cta}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
