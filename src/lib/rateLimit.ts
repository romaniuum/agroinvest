// Ограничение частоты в памяти процесса. Приложение работает в одном экземпляре,
// поэтому общего хранилища не нужно; после перезапуска счётчики обнуляются.
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(key, fresh);
      else hits.delete(key);
    }
  }

  return {
    // Лимит исчерпан? Попытку не засчитывает.
    blocked(key: string, now = Date.now()): boolean {
      const times = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      return times.length >= limit;
    },

    reset(key: string) {
      hits.delete(key);
    },

    // true — запрос разрешён и засчитан, false — лимит исчерпан.
    hit(key: string, now = Date.now()): boolean {
      if (hits.size > 10_000) prune(now);
      const times = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (times.length >= limit) {
        hits.set(key, times);
        return false;
      }
      times.push(now);
      hits.set(key, times);
      return true;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
