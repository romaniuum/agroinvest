// Статичные цены и фото. На этапе 3 будут браться из базы.
export type Service = {
  slug: "repair" | "install" | "maintenance";
  title: string;
  points: string[];
  priceFrom: string;
  unit: string;
  cta: string;
};

export const services: Service[] = [
  {
    slug: "repair",
    title: "Ремонт котла",
    points: [
      "Котёл не включается или гаснет",
      "Не греет воду или батареи",
      "Ошибка на дисплее, шум, запах",
    ],
    priceFrom: "[ЦЕНА]",
    unit: "",
    cta: "Вызвать мастера",
  },
  {
    slug: "install",
    title: "Монтаж системы отопления",
    points: [
      "Подбор котла под ваш дом",
      "Установка котла, труб и радиаторов",
      "Запуск и настройка системы",
    ],
    priceFrom: "[ЦЕНА]",
    unit: "",
    cta: "Рассчитать стоимость",
  },
  {
    slug: "maintenance",
    title: "Обслуживание котельной",
    points: [
      "Плановое ТО по графику",
      "Чистка и проверка безопасности",
      "Срочный выезд при аварии",
    ],
    priceFrom: "[ЦЕНА]",
    unit: "/ мес",
    cta: "Обсудить договор",
  },
];

export type WorkPhoto = { id: number; caption: string; src: string | null };

export const workPhotos: WorkPhoto[] = [
  { id: 1, caption: "Замена газового котла в частном доме", src: null },
  { id: 2, caption: "Монтаж радиаторов отопления", src: null },
  { id: 3, caption: "Обслуживание котельной", src: null },
];

export const serviceOptions = [
  "Ремонт котла",
  "Монтаж системы отопления",
  "Обслуживание котельной",
  "Другое, не знаю",
];
