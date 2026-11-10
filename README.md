# Aleks Rove — корпоративный сайт

Фронтенд корпоративного сайта по ТЗ: React 19 + Next.js 16 (App Router), TypeScript, Tailwind CSS 4.
Контент, медиа и заявки — из Java-бэкенда [aleks-rove-back](https://github.com/derbikov-com/aleks-rove-back) (CMS с ролями),
контракт в [docs/backend-api.md](docs/backend-api.md). Без `BACKEND_API_URL` сайт работает на демо-контенте из `src/content`.

## Что внутри

| Требование ТЗ | Реализация |
|---|---|
| Адаптивность от 320px | Mobile-first вёрстка, проверена на 320 / 390 / 1440px без горизонтального скролла |
| Формы обратной связи | Валидация на клиенте и сервере, состояния ошибок, honeypot + проверка времени заполнения + лимит 5 заявок / 10 мин с IP, редирект на `/spasibo` (форма на странице) или успех в модальном окне |
| ЧПУ | `/uslugi/integratsii-crm-1c`, `/keisy/...`, `/blog/...`, `/blog/kategoriya/...`, `/blog/teg/...` |
| Мета-теги, Open Graph | Title / Description / Keywords / canonical / OG / Twitter на каждой странице, SEO-поля у каждой сущности |
| XML-карта сайта | `/sitemap.xml` генерируется автоматически из контента |
| Schema.org | Organization, WebSite, BreadcrumbList, BlogPosting, Article, Service, FAQPage, ContactPage |
| Производительность | Статическая генерация всех страниц, ISR при работе с бэкендом, ленивая загрузка и автоконвертация изображений в AVIF/WebP, минификация, self-hosted шрифт |
| Аналитика | Яндекс.Метрика + GA4 по env-переменным; события ниже |
| Безопасность | Версия платформы скрыта (`x-powered-by` off), HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, антиспам форм |

### События аналитики (цели Метрики = события GA4)

| Событие | Когда |
|---|---|
| `generate_lead` | успешная отправка любой формы (параметр `form` — где) |
| `lead_modal_open` | открытие окна заявки |
| `cta_click` | клик по кнопке призыва к действию |
| `phone_click` / `email_click` | клик по телефону / email |

В Метрике создайте JS-цели с этими идентификаторами, в GA4 отметьте `generate_lead` как ключевое событие.
Переходы между страницами Метрика получает через `hit`, GA4 — через расширенную статистику (включена по умолчанию).

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Обложки-заглушки и OG-картинка генерируются скриптом `node scripts/generate-images.mjs`.

## Переменные окружения

См. [.env.example](.env.example). Главное:

- `NEXT_PUBLIC_SITE_URL` — боевой адрес (canonical, sitemap, OG).
- `NEXT_PUBLIC_SITE_INDEXABLE=true` — только на боевом домене. Без неё сайт закрыт от индексации (robots + noindex).
- `NEXT_PUBLIC_YM_ID`, `NEXT_PUBLIC_GA_ID` — счётчики.
- `BACKEND_API_URL`, `BACKEND_API_KEY` — Java-бэкенд. Пока не заданы: контент из `src/content`, заявки пишутся в лог сервиса.
- `REVALIDATE_SECRET` — секрет для `/api/revalidate`, который дёргает бэкенд после изменений в админке.

`NEXT_PUBLIC_*` встраиваются при сборке — после изменения нужен редеплой.

## Деплой

Railway собирает `Dockerfile` (Next.js standalone, Node 22). Пуш в `main` → автодеплой.

## Структура

```
src/app/            страницы и маршруты (sitemap.ts, robots.ts, api/leads)
src/components/     UI-компоненты, форма, модалка, аналитика
src/content/        демо-контент (заменится данными из админки)
src/lib/cms.ts      слой данных: локальный контент или Java API
src/lib/seo.ts      мета-теги и JSON-LD
```

## Что дальше

- Интерфейс админки поверх API бэкенда (вход по коду, редакторы контента, медиабиблиотека, заявки).
- Заменить демо-тексты, контакты, реквизиты в политике и фирменный стиль (токены в `src/app/globals.css`).
