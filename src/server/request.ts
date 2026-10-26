// IP клиента. На сервере его подставляет Caddy в X-Forwarded-For.
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",").at(-1)?.trim() || "unknown";
}
