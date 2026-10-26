// Готовит сертификаты для сайта: incoming/certificates/<имя>.jpg|png →
// public/certificates/<имя>-400.webp и -1600.webp, размеры превью — в src/lib/certificate-sizes.json.
// Запуск: node scripts/prepare-certificates.mjs
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "incoming/certificates";
const OUT = "public/certificates";
const sizes = {};

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) =>
  /\.(jpe?g|png|webp)$/i.test(f),
);
if (!files.length) throw new Error(`В ${SRC} нет картинок`);

for (const file of files.sort()) {
  const name = path.parse(file).name.toLowerCase();
  const input = path.join(SRC, file);
  for (const width of [400, 1600]) {
    const info = await sharp(input)
      .rotate()
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality: width === 400 ? 75 : 82 })
      .toFile(path.join(OUT, `${name}-${width}.webp`));
    if (width === 400) sizes[name] = { width: info.width, height: info.height };
  }
  console.log(`${name}: ${sizes[name].width}×${sizes[name].height}`);
}

await writeFile(
  "src/lib/certificate-sizes.json",
  JSON.stringify(sizes, null, 2) + "\n",
);
console.log(`Готово: ${files.length} шт.`);
