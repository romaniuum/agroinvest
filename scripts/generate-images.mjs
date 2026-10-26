// Генерирует иконки сайта и картинку для соцсетей из SVG.
// Запуск: node scripts/generate-images.mjs (результат коммитится, в сборке не участвует)
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const FLAME =
  "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3.5.5-6 1-8.5Z";

// Пламя в синем квадрате со скруглением — как логотип в шапке
const icon = (
  size,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="11" fill="#1A5DAB"/>
  <path d="${FLAME}" transform="translate(6 5) scale(1.5)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0F2A47"/>
  <rect x="0" y="560" width="1200" height="70" fill="#1A5DAB"/>
  <g transform="translate(96 110)">
    <rect width="120" height="120" rx="28" fill="#1A5DAB"/>
    <path d="${FLAME}" transform="translate(15 12) scale(3.75)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="250" y="190" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="#fff">Агроинвест</text>
  <text x="96" y="350" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#fff">Ремонт газовых котлов</text>
  <text x="96" y="420" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#fff">и отопление под ключ</text>
  <text x="96" y="500" font-family="Arial, sans-serif" font-size="36" fill="#EAF3FC">Выезд в день обращения · Цена до начала работ</text>
  <text x="96" y="607" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#fff">+7 (999) 999-99-99</text>
</svg>`;

// ICO с одной PNG-картинкой внутри (так умеют все браузеры)
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // зарезервировано
  header.writeUInt16LE(1, 2); // тип: иконка
  header.writeUInt16LE(1, 4); // одна картинка
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // плоскости
  header.writeUInt16LE(32, 12); // бит на пиксель
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // смещение данных
  return Buffer.concat([header, png]);
}

await writeFile("src/app/icon.svg", icon(48));
await sharp(Buffer.from(icon(180)))
  .png()
  .toFile("src/app/apple-icon.png");
const favicon = await sharp(Buffer.from(icon(32)))
  .png()
  .toBuffer();
await writeFile("src/app/favicon.ico", ico(favicon, 32));
await sharp(Buffer.from(og))
  .png({ compressionLevel: 9 })
  .toFile("public/og.png");
console.log("Готово: icon.svg, apple-icon.png, favicon.ico, public/og.png");
