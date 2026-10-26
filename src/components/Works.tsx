import Image from "next/image";
import { workPhotos } from "@/lib/content";
import { ImageIcon } from "./icons";
import ui from "./ui.module.css";
import s from "./Works.module.css";

export function Works() {
  return (
    <section className={ui.sectionSky} aria-labelledby="works-title">
      <div className={ui.container}>
        <h2 id="works-title" className={ui.h2}>
          Наши работы
        </h2>
        <div className={s.grid}>
          {workPhotos.slice(0, 3).map((photo) => (
            <figure key={photo.id} className={s.card}>
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  width={800}
                  height={600}
                  sizes="(max-width: 900px) 100vw, 400px"
                  className={s.image}
                />
              ) : (
                <div className={s.placeholder} aria-hidden="true">
                  <ImageIcon size={40} />
                </div>
              )}
              <figcaption className={s.caption}>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
