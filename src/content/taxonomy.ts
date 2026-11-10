import type { Category, Tag } from "@/lib/types";

export const categories: Category[] = [
  { slug: "razrabotka", name: "Разработка", description: "Как мы проектируем, разрабатываем и запускаем цифровые продукты." },
  { slug: "avtomatizatsiya", name: "Автоматизация", description: "Практика автоматизации процессов и интеграции систем." },
  { slug: "analitika", name: "Аналитика", description: "Данные, метрики и отчётность, которые помогают принимать решения." },
];

export const tags: Tag[] = [
  { slug: "mvp", name: "MVP" },
  { slug: "crm", name: "CRM" },
  { slug: "1s", name: "1С" },
  { slug: "integratsii", name: "Интеграции" },
  { slug: "bi", name: "BI" },
  { slug: "ux", name: "UX" },
  { slug: "processy", name: "Процессы" },
  { slug: "bezopasnost", name: "Безопасность" },
];
