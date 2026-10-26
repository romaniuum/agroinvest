import { site } from "@/lib/site";
import { PhoneIcon } from "./icons";
import { LeadForm } from "./LeadForm";
import ui from "./ui.module.css";
import s from "./LeadSection.module.css";

export function LeadSection() {
  return (
    <section id="zayavka" className={s.section} aria-labelledby="lead-title">
      <div className={`${ui.container} ${s.inner}`}>
        <div className={s.text}>
          <h2 id="lead-title" className={s.title}>
            Оставьте заявку — мы перезвоним
          </h2>
          <p className={s.lead}>
            Перезвоним в течение {site.callbackTime} в рабочее время, уточним
            задачу и назовём цену.
          </p>
          <p className={s.or}>Или позвоните сами:</p>
          <a href={site.phoneHref} className={s.phone}>
            <PhoneIcon size={28} />
            {site.phone}
          </a>
        </div>
        <div className={s.card}>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
