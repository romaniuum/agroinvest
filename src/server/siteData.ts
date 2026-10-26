import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./db";

export const PRICES_TAG = "prices";
export const PHOTOS_TAG = "photos";

export type PriceMap = Record<
  string,
  { priceFrom: number | null; unit: string }
>;

// Кеш в памяти сервера; админка сбрасывает его через updateTag после сохранения.
export async function getPrices(): Promise<PriceMap> {
  "use cache";
  cacheTag(PRICES_TAG);
  cacheLife("hours");
  const rows = await prisma.servicePrice.findMany();
  return Object.fromEntries(
    rows.map((r) => [r.slug, { priceFrom: r.priceFrom, unit: r.unit }]),
  );
}

export type SitePhoto = { id: number; fileName: string; caption: string };

// Первые три фото для блока «Наши работы».
export async function getSitePhotos(): Promise<SitePhoto[]> {
  "use cache";
  cacheTag(PHOTOS_TAG);
  cacheLife("hours");
  return prisma.workPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    take: 3,
    select: { id: true, fileName: true, caption: true },
  });
}
