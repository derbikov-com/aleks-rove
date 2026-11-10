// Простое ограничение частоты запросов в памяти процесса.
// Для нескольких инстансов заменить на Redis или вынести в бэкенд.

const hits = new Map<string, number[]>();
let lastSweep = Date.now();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > windowMs) {
    for (const [k, times] of hits) if (times.every((t) => now - t > windowMs)) hits.delete(k);
    lastSweep = now;
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
