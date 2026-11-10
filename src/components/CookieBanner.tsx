"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { buttonClass } from "./ui";

const KEY = "ar_cookie_notice";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

function readAccepted() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function CookieBanner() {
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);
  const [dismissed, setDismissed] = useState(false);

  if (accepted || dismissed) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // хранилище недоступно — просто скрываем до перезагрузки
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Уведомление о cookie"
      className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-xl flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-lift)] sm:inset-x-auto sm:left-4 sm:flex-row sm:items-center"
    >
      <p className="text-sm leading-relaxed text-muted">
        Мы используем cookie и сервисы веб-аналитики, чтобы сайт работал удобнее. Подробнее — в{" "}
        <Link href="/politika-konfidencialnosti" className="text-brand underline underline-offset-2">
          политике
        </Link>
        .
      </p>
      <button type="button" onClick={accept} className={buttonClass("dark", "md", "shrink-0")}>
        Понятно
      </button>
    </div>
  );
}
