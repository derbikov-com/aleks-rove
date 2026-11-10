"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav, site } from "@/lib/site";
import type { SiteContacts } from "@/lib/types";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { OpenLeadButton } from "./OpenLeadButton";
import { cn } from "./ui";

export function Header({ contacts }: { contacts: SiteContacts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Перейти к содержимому
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link href="/" aria-label={`${site.name} — на главную`} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label="Основное меню" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[0.9375rem] font-semibold transition-colors",
                    isActive(item.href) ? "bg-brand-soft text-brand" : "text-ink/75 hover:bg-paper hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${contacts.phoneHref}`}
            data-track-location="header"
            className="hidden text-[0.9375rem] font-bold text-ink transition-colors hover:text-brand md:inline"
          >
            {contacts.phone}
          </a>
          <div className="hidden sm:block">
            <OpenLeadButton source="header" />
          </div>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-white lg:hidden"
      >
        <nav aria-label="Мобильное меню" className="container-x py-6">
          <ul className="divide-y divide-line">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between py-4 text-xl font-bold",
                    isActive(item.href) ? "text-brand" : "text-ink",
                  )}
                >
                  {item.label}
                  <Icon name="arrowRight" size={20} className="text-ink/30" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={`tel:${contacts.phoneHref}`}
              data-track-location="mobile-menu"
              className="flex items-center gap-3 text-lg font-bold"
            >
              <Icon name="phone" size={20} className="text-brand" />
              {contacts.phone}
            </a>
            <a href={`mailto:${contacts.email}`} className="flex items-center gap-3 text-lg font-semibold text-muted">
              <Icon name="mail" size={20} className="text-brand" />
              {contacts.email}
            </a>
          </div>
          <OpenLeadButton source="mobile-menu" size="lg" className="mt-8 w-full" onOpen={() => setOpen(false)} />
        </nav>
      </div>
    </header>
  );
}
