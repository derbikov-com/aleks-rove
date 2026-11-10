// Отправка событий в Яндекс.Метрику и GA4. Счётчики подключаются в components/Analytics.tsx.

export const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : undefined;
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || undefined;

type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    if (GA_ID) window.gtag?.("event", event, params);
    if (YM_ID) window.ym?.(YM_ID, "reachGoal", event, params);
  } catch {
    // аналитика не должна ломать интерфейс
  }
  if (process.env.NODE_ENV === "development") console.debug("[track]", event, params);
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const UTM_STORAGE = "ar_utm";

export function rememberUtm() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(UTM_KEYS.flatMap((k) => (sp.get(k) ? [[k, sp.get(k)!]] : [])));
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_STORAGE, JSON.stringify(utm));
  } catch {
    // sessionStorage может быть недоступен
  }
}

export function readUtm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE) ?? "{}");
  } catch {
    return {};
  }
}
