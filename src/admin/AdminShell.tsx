"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/components/ui";
import { API_URL } from "./api";
import { AuthProvider, useAuth } from "./auth";
import { LoginScreen } from "./LoginScreen";
import { allowedFor, NAV } from "./nav";
import { ROLE_LABEL } from "./types";
import { EmptyState, LoadingBlock, ToastProvider } from "./ui";

export function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Gate>{children}</Gate>
      </ToastProvider>
    </AuthProvider>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!API_URL) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper p-6">
        <EmptyState title="Бэкенд не подключён" text="Задайте BACKEND_API_URL при сборке сайта — админка работает через API бэкенда." />
      </div>
    );
  }
  if (auth.status === "loading") return <LoadingBlock />;
  if (auth.status === "anon") return <LoginScreen />;
  return <Shell>{children}</Shell>;
}

function Shell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (auth.status !== "ready") return null;
  const me = auth.me;
  const items = NAV.filter((n) => n.roles.includes(me.role));
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Разделы админки" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {items.map((n) => (
          <li key={n.href}>
            <Link
              href={n.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-semibold transition-colors",
                isActive(n.href) ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon name={n.icon} size={19} className={isActive(n.href) ? "text-accent" : ""} />
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  const user = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-bold text-white">{me.name || me.email}</p>
      <p className="truncate text-xs text-white/55">
        {ROLE_LABEL[me.role]} · {me.email}
      </p>
      <div className="mt-3 flex gap-2">
        <a href="/" target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-white/15">
          Открыть сайт
        </a>
        <button type="button" onClick={auth.logout} className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          Выйти
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper lg:pl-64">
      {/* боковое меню: фиксированное на десктопе, выезжающее на мобильных */}
      <aside className="on-dark fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5 text-white">
          <LogoMark />
          <span className="font-extrabold tracking-tight">Админка</span>
        </Link>
        {nav}
        {user}
      </aside>

      <header className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <span className="font-extrabold">Админка</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/10"
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </header>
      {menuOpen && (
        <div className="on-dark fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-ink lg:hidden">
          {nav}
          {user}
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        {allowedFor(pathname, me.role) ? (
          children
        ) : (
          <EmptyState title="Недостаточно прав" text="Этот раздел доступен другим ролям. Если он нужен — попросите администратора." />
        )}
      </main>
    </div>
  );
}
