import { site, workHours } from "./site";

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// «Перезвоним в понедельник», «во вторник» и т. д.
const weekdayAccusative = [
  "в воскресенье",
  "в понедельник",
  "во вторник",
  "в среду",
  "в четверг",
  "в пятницу",
  "в субботу",
];

// День недели и час в часовом поясе компании.
function zonedTime(date: Date): { day: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: workHours.timeZone,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  return { day: weekdayIndex[weekday], hour };
}

export function isWorkingTime(date: Date): boolean {
  const { day, hour } = zonedTime(date);
  return (
    workHours.days.includes(day) &&
    hour >= workHours.start &&
    hour < workHours.end
  );
}

// Когда перезвоним: «сегодня», «завтра» или «в понедельник».
function nextWorkDay(date: Date): string {
  const { day, hour } = zonedTime(date);
  if (workHours.days.includes(day) && hour < workHours.start) return "сегодня";
  for (let shift = 1; shift <= 7; shift++) {
    const next = (day + shift) % 7;
    if (workHours.days.includes(next)) {
      return shift === 1 ? "завтра" : weekdayAccusative[next];
    }
  }
  return "завтра";
}

export function callbackMessage(date: Date): string {
  if (isWorkingTime(date)) {
    return `Перезвоним в течение ${site.callbackTime}.`;
  }
  return `Перезвоним ${nextWorkDay(date)} с ${workHours.start}:00.`;
}
