# Контракт API для Java-бэкенда

Реализован в [aleks-rove-back](https://github.com/derbikov-com/aleks-rove-back) (Swagger: `/swagger-ui.html` бэкенда).

Фронтенд работает без бэкенда на демо-контенте из `src/content`. Как только задан `BACKEND_API_URL`,
весь контент и заявки идут через API ниже. Типы полей — в `src/lib/types.ts`.

Сброс кэша: после изменений в админке бэкенд вызывает `POST /api/revalidate` сайта с заголовком
`x-revalidate-secret` (= `REVALIDATE_SECRET`), сайт помечает тег `cms` устаревшим и следующий запрос получает свежие данные.

## Публичные эндпоинты (читает сайт)

Ответы в JSON, кэшируются сайтом на 5 минут (ISR). `404` для отсутствующего slug.

| Метод | Путь | Ответ |
|---|---|---|
| GET | `/api/public/services` | `Service[]` в порядке вывода |
| GET | `/api/public/services/{slug}` | `Service` |
| GET | `/api/public/cases` | `CaseStudy[]` |
| GET | `/api/public/cases/{slug}` | `CaseStudy` |
| GET | `/api/public/posts?category=&tag=` | `Post[]` (только опубликованные) |
| GET | `/api/public/posts/{slug}` | `Post` |
| GET | `/api/public/categories` | `Category[]` |
| GET | `/api/public/tags` | `Tag[]` |
| GET | `/api/public/faq` | `Faq[]` |
| POST | `/api/public/leads` | `201`/`200` — заявка принята |

Картинки (`cover.src`) — абсолютные URL медиабиблиотеки; домен нужно добавить в `images.remotePatterns` в `next.config.ts`.
Поле `seo` у каждой сущности — `{ title, description, keywords[], ogImage, noindex }`, редактируется в админке.

### POST /api/public/leads

Сайт уже провалидировал данные и отсеял спам (honeypot, проверка времени, лимит 5 заявок / 10 минут с IP).
Заголовок `X-Api-Key` — значение `BACKEND_API_KEY`.

```json
{
  "name": "Иван",
  "phone": "+7 (900) 000-00-00",
  "email": "ivan@example.com",
  "company": "ООО Пример",
  "message": "Нужна интеграция CRM и 1С",
  "consent": true,
  "source": "home-cta",
  "page": "/",
  "utm": { "utm_source": "yandex" },
  "ip": "203.0.113.10",
  "userAgent": "Mozilla/5.0 ...",
  "createdAt": "2026-11-10T09:00:00.000Z"
}
```

Бэкенд сохраняет заявку и отправляет уведомление на email заказчика.

## Что должно быть в админке (из ТЗ)

- Роли: Администратор (всё), Редактор (публикация и редактирование), Автор (черновики).
- Разделы: страницы, записи блога, категории, метки, услуги, кейсы, FAQ, медиабиблиотека, заявки, глобальные настройки (контакты, меню).
- SEO-поля у каждой страницы/записи.
- Ограничение попыток входа, журнал действий.
- После публикации — вызов ревалидации сайта (`/api/revalidate`).
- Бэкапы БД и медиа с хранением ≥ 7 дней.
