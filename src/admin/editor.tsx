"use client";

import { useEffect, type ReactNode } from "react";
import { ApiError, errorMessage } from "./api";
import type { FieldErrors } from "./forms";

/** Раскладка формы: основное слева, публикация/обложка/SEO справа. */
export function EditorLayout({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">{main}</div>
      <aside className="space-y-6 lg:sticky lg:top-6">{side}</aside>
    </div>
  );
}

/** Предупреждение при закрытии вкладки с несохранёнными изменениями. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/** Разбирает ошибку сохранения: ошибки полей — в форму, общий текст — в уведомление. */
export function saveError(e: unknown): { message: string; fields: FieldErrors } {
  if (e instanceof ApiError) return { message: e.message, fields: e.fields };
  return { message: errorMessage(e), fields: {} };
}

export function SeoDetails({ children }: { children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-line bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-bold [&::-webkit-details-marker]:hidden">
        SEO
        <span className="text-sm font-semibold text-muted group-open:hidden">Title, description…</span>
      </summary>
      <div className="border-t border-line p-5">{children}</div>
    </details>
  );
}

export const confirmDelete = (what: string) => window.confirm(`Удалить ${what}? Это действие нельзя отменить.`);
