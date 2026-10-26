import { workHours } from "./site";

const dayKey = (date: Date) =>
  date.toLocaleDateString("ru-RU", { timeZone: workHours.timeZone });

// «Сегодня, 14:05», «Вчера, 09:30» или «26 октября, 14:05» — по московскому времени.
export function formatLeadTime(date: Date, now = new Date()): string {
  const time = date.toLocaleTimeString("ru-RU", {
    timeZone: workHours.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(now)) return `Сегодня, ${time}`;
  if (dayKey(date) === dayKey(yesterday)) return `Вчера, ${time}`;
  const day = date.toLocaleDateString("ru-RU", {
    timeZone: workHours.timeZone,
    day: "numeric",
    month: "long",
  });
  return `${day}, ${time}`;
}
