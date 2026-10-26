import { connection } from "next/server";
import { Suspense } from "react";
import { photoSrcSet, photoUrl } from "@/lib/photos";
import { getSitePhotos } from "@/server/siteData";
import ui from "./ui.module.css";
import s from "./Works.module.css";

// Блок появляется, когда в админке загружено хотя бы одно фото.
export function Works() {
  return (
    <Suspense fallback={null}>
      <WorksSection />
    </Suspense>
  );
}

async function WorksSection() {
  await connection();
  const photos = await getSitePhotos();
  if (!photos.length) return null;

  return (
    <section className={ui.sectionSky} aria-labelledby="works-title">
      <div className={ui.container}>
        <h2 id="works-title" className={ui.h2}>
          Наши работы
        </h2>
        <div className={s.grid}>
          {photos.map((photo) => (
            <figure key={photo.id} className={s.card}>
              {/* eslint-disable-next-line @next/next/no-img-element -- фото уже уменьшены и в WebP */}
              <img
                src={photoUrl(photo.fileName, 800)}
                srcSet={photoSrcSet(photo.fileName)}
                sizes="(max-width: 900px) 100vw, 400px"
                alt={photo.caption || "Пример нашей работы"}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className={s.image}
              />
              {photo.caption && (
                <figcaption className={s.caption}>{photo.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
