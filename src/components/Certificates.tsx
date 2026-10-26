import { certificateSize, certificates } from "@/lib/certificates";
import ui from "./ui.module.css";
import s from "./Certificates.module.css";

const src = (file: string, size: 400 | 1600) =>
  `/certificates/${file}-${size}.webp`;

export function Certificates() {
  return (
    <section className={ui.section} aria-labelledby="certificates-title">
      <div className={ui.container}>
        <h2 id="certificates-title" className={ui.h2}>
          Лицензии и сертификаты
        </h2>
        <p className={s.lead}>
          Наши мастера обучены и допущены производителями к монтажу и
          обслуживанию их котлов. Нажмите на документ, чтобы открыть его
          целиком.
        </p>
        <ul className={s.grid}>
          {certificates.map((c) => (
            <li key={c.file}>
              <a
                href={src(c.file, 1600)}
                target="_blank"
                rel="noopener"
                className={s.card}
              >
                <span className={s.frame}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- превью заранее уменьшены */}
                  <img
                    src={src(c.file, 400)}
                    alt={`Сертификат ${c.brand}: ${c.text}`}
                    width={certificateSize(c.file).width}
                    height={certificateSize(c.file).height}
                    loading="lazy"
                    decoding="async"
                    className={s.image}
                  />
                </span>
                <span className={s.brand}>{c.brand}</span>
                <span className={s.text}>{c.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
