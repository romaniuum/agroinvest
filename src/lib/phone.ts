// Десять цифр номера без кода страны. Первую 7 или 8 считаем кодом страны.
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (value.trim().startsWith("+7")) {
    digits = digits.slice(1);
  } else if (
    /^[78]/.test(digits) &&
    (digits.length === 1 || digits.length === 11)
  ) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

// Маска +7 (999) 999-99-99, частично заполненный номер без лишних знаков в конце.
export function formatPhone(value: string): string {
  const d = phoneDigits(value);
  if (!d) return "";
  let out = `+7 (${d.slice(0, 3)}`;
  if (d.length > 3) out += `) ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

export function isPhoneComplete(value: string): boolean {
  return phoneDigits(value).length === 10;
}
