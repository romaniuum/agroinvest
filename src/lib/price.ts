// «от 2 500 ₽ / мес». Пока цена не заполнена — без суммы.
export function formatPrice(priceFrom: number | null, unit: string): string {
  if (priceFrom === null) return "Цену назовём по телефону";
  const sum = priceFrom.toLocaleString("ru-RU");
  return `от ${sum} ₽${unit ? ` ${unit}` : ""}`;
}
