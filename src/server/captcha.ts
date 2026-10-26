// Проверка токена Яндекс SmartCaptcha.
// Без серверного ключа проверка выключена (разработка, пока ключи не выданы).
// Если сервис капчи недоступен, заявку пропускаем: потерять клиента хуже, чем пропустить бота.
export async function verifyCaptcha(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  const secret = process.env.SMARTCAPTCHA_SERVER_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://smartcaptcha.yandexcloud.net/validate", {
      method: "POST",
      body: new URLSearchParams({ secret, token, ip }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`SmartCaptcha: ответ ${res.status}, заявка пропущена`);
      return true;
    }
    const data = (await res.json()) as { status?: string };
    return data.status === "ok";
  } catch (error) {
    console.error("SmartCaptcha недоступна, заявка пропущена:", error);
    return true;
  }
}
