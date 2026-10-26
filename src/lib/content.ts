// Тексты карточек услуг. Цены хранятся в базе (таблица ServicePrice, ключ — slug).
export type Service = {
  slug: "repair" | "install" | "maintenance";
  title: string;
  points: string[];
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
    cta: "Обсудить договор",
  },
];

// Значения совпадают с enum ServiceType в prisma/schema.prisma.
export const serviceOptions = [
  { value: "REPAIR", label: "Ремонт котла" },
  { value: "INSTALL", label: "Монтаж системы отопления" },
  { value: "MAINTENANCE", label: "Обслуживание котельной" },
  { value: "OTHER", label: "Другое, не знаю" },
] as const;

export type ServiceValue = (typeof serviceOptions)[number]["value"];

export function serviceLabel(value: ServiceValue): string {
  return serviceOptions.find((o) => o.value === value)?.label ?? value;
}
