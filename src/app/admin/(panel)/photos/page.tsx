import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { PhotoCard } from "../../_components/PhotoCard";
import { PhotoUpload } from "../../_components/PhotoUpload";
import s from "../../admin.module.css";

export default async function PhotosPage() {
  await requireAdmin();
  // Тот же порядок, что на сайте: новые сверху, на сайте — первые три.
  const photos = await prisma.workPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  });

  return (
    <>
      <h1 className={s.title}>Фото работ</h1>
      <p className={s.hint}>
        На сайте показываются три последних добавленных фото.
      </p>
      <PhotoUpload />
      {photos.length === 0 ? (
        <p className={s.empty}>
          Фото пока нет. Пока их нет, блок «Наши работы» на сайте скрыт.
        </p>
      ) : (
        <ul className={s.photoGrid}>
          {photos.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              fileName={photo.fileName}
              caption={photo.caption}
              onSite={i < 3}
            />
          ))}
        </ul>
      )}
    </>
  );
}
