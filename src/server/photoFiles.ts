import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import { PHOTO_FILE_RE, PHOTO_SIZES } from "@/lib/photos";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function uploadDir(): string {
  // Папка задаётся при запуске, в сборку её содержимое не входит.
  return path.resolve(
    /*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "uploads",
  );
}

export class PhotoError extends Error {}

// Уменьшает фото до 800 и 1600 px по ширине и сохраняет в WebP. Возвращает имя без размера.
export async function savePhotoFiles(input: Buffer): Promise<string> {
  let meta: Metadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new PhotoError("Это не похоже на фотографию");
  }
  if (!["jpeg", "png", "webp"].includes(meta.format ?? "")) {
    throw new PhotoError("Подходят фото в формате JPG, PNG или WebP");
  }

  const name = randomBytes(12).toString("hex");
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  for (const size of PHOTO_SIZES) {
    const data = await sharp(input)
      .rotate()
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    await writeFile(path.join(dir, `${name}-${size}.webp`), data);
  }
  return name;
}

export async function deletePhotoFiles(name: string): Promise<void> {
  await Promise.all(
    PHOTO_SIZES.map((size) =>
      rm(path.join(uploadDir(), `${name}-${size}.webp`), { force: true }),
    ),
  );
}

export async function readPhotoFile(file: string): Promise<Buffer | null> {
  if (!PHOTO_FILE_RE.test(file)) return null;
  try {
    return await readFile(path.join(uploadDir(), file));
  } catch {
    return null;
  }
}
