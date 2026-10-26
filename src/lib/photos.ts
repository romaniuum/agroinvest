export const PHOTO_SIZES = [800, 1600] as const;
export type PhotoSize = (typeof PHOTO_SIZES)[number];

export function photoUrl(fileName: string, size: PhotoSize): string {
  return `/uploads/${fileName}-${size}.webp`;
}

export function photoSrcSet(fileName: string): string {
  return PHOTO_SIZES.map((s) => `${photoUrl(fileName, s)} ${s}w`).join(", ");
}

// Имя файла на диске: только то, что создаёт сервер.
export const PHOTO_FILE_RE = /^[a-f0-9]{24}-(800|1600)\.webp$/;
