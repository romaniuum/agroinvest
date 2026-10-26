export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED";

export const statusLabel: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
  REJECTED: "Отказ",
};

// Фильтры списка заявок: значение в адресе → статусы.
export const leadFilters = {
  new: { label: "Новые", statuses: ["NEW"] },
  work: { label: "В работе", statuses: ["IN_PROGRESS"] },
  done: { label: "Готово", statuses: ["DONE"] },
  all: { label: "Все", statuses: null },
} as const satisfies Record<
  string,
  { label: string; statuses: readonly LeadStatus[] | null }
>;

export type LeadFilter = keyof typeof leadFilters;

export function parseLeadFilter(value: unknown): LeadFilter {
  return typeof value === "string" && value in leadFilters
    ? (value as LeadFilter)
    : "new";
}
