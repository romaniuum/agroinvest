import sizes from "./certificate-sizes.json";

// Сертификаты и удостоверения мастеров. Картинки лежат в public/certificates:
// <file>-400.webp (превью) и <file>-1600.webp (открывается по нажатию).
// Готовит их scripts/prepare-certificates.mjs из папки incoming/certificates.
export type Certificate = {
  file: keyof typeof sizes;
  brand: string;
  text: string;
};

export const certificates: Certificate[] = [
  {
    file: "vaillant",
    brand: "Vaillant",
    text: "Монтаж и обслуживание котлов · Ветров М. В.",
  },
  {
    file: "protherm",
    brand: "Protherm",
    text: "Монтаж и сервис оборудования · Ветров М. В.",
  },
  {
    file: "viessmann",
    brand: "Viessmann",
    text: "Настенные котлы Vitopend · Ветров М. В.",
  },
  {
    file: "baxi-mikhail",
    brand: "BAXI",
    text: "Подбор, монтаж и сервис · Ветров М. В.",
  },
  {
    file: "baxi-valery",
    brand: "BAXI",
    text: "Подбор, монтаж и сервис · Ветров В. А.",
  },
  {
    file: "baxi-eliseev",
    brand: "BAXI",
    text: "Подбор, монтаж и сервис · Елисеев А. А.",
  },
  {
    file: "arderia",
    brand: "Arderia",
    text: "Устройство, монтаж и обслуживание котлов · Ветров М.",
  },
  {
    file: "baltgaz",
    brand: "BaltGaz",
    text: "Оборудование NEVA, VEKTOR, MASTER GAS · Ветров М. В.",
  },
  { file: "zont", brand: "ZONT", text: "Контроллеры отопления · Ветров М. В." },
];

// Размеры превью — чтобы страница не прыгала, пока картинки грузятся.
export const certificateSize = (file: Certificate["file"]) => sizes[file];
