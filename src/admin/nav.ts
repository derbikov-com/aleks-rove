import type { IconKey } from "@/components/Icon";
import type { Role } from "./types";

export type NavItem = { href: string; label: string; icon: IconKey; roles: Role[] };

const ALL: Role[] = ["ADMIN", "EDITOR", "AUTHOR"];
const STAFF: Role[] = ["ADMIN", "EDITOR"];

export const NAV: NavItem[] = [
  { href: "/admin", label: "Сводка", icon: "target", roles: ALL },
  { href: "/admin/leads", label: "Заявки", icon: "mail", roles: STAFF },
  { href: "/admin/posts", label: "Статьи", icon: "code", roles: ALL },
  { href: "/admin/services", label: "Услуги", icon: "compass", roles: STAFF },
  { href: "/admin/cases", label: "Кейсы", icon: "chart", roles: STAFF },
  { href: "/admin/taxonomy", label: "Рубрики и метки", icon: "workflow", roles: STAFF },
  { href: "/admin/faq", label: "Вопросы (FAQ)", icon: "lifebuoy", roles: STAFF },
  { href: "/admin/pages", label: "Страницы", icon: "key", roles: STAFF },
  { href: "/admin/media", label: "Медиабиблиотека", icon: "plug", roles: ALL },
  { href: "/admin/users", label: "Пользователи", icon: "shield", roles: ["ADMIN"] },
  { href: "/admin/settings", label: "Настройки сайта", icon: "repeat", roles: ["ADMIN"] },
];

/** Доступен ли раздел роли — по самому длинному совпадающему префиксу. */
export function allowedFor(pathname: string, role: Role) {
  const item = [...NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  return !item || item.roles.includes(role);
}
