// Глобальные настройки сайта. После подключения бэкенда часть полей
// (контакты, соцсети, тексты) будет приходить из админки.

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const site = {
  name: "Aleks Rove",
  tagline: "Цифровые решения для бизнеса",
  description:
    "Проектируем, разрабатываем и сопровождаем цифровые продукты для бизнеса: веб-сервисы, автоматизацию процессов, интеграции и аналитику.",
  keywords: [
    "разработка веб-сервисов",
    "автоматизация бизнес-процессов",
    "интеграция CRM и 1С",
    "BI-аналитика",
    "цифровая трансформация",
  ],
  url: rawUrl.replace(/\/$/, ""),
  locale: "ru_RU",
  email: "aleks-rove@yandex.ru",
  phone: "+7 (900) 000-00-00",
  phoneHref: "+79000000000",
  address: {
    city: "Москва",
    street: "ул. Примерная, 1",
    postalCode: "101000",
    country: "RU",
  },
  workingHours: "Пн–Пт, 10:00–19:00 (МСК)",
  foundedYear: 2016,
  // Индексацию включаем только на боевом домене: NEXT_PUBLIC_SITE_INDEXABLE=true
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
} as const;

export const mainNav = [
  { href: "/uslugi", label: "Услуги" },
  { href: "/keisy", label: "Кейсы" },
  { href: "/o-kompanii", label: "О компании" },
  { href: "/blog", label: "Блог" },
  { href: "/kontakty", label: "Контакты" },
] as const;

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
