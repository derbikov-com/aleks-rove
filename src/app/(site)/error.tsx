"use client";

import { buttonClass } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="container-x text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Что-то пошло не так</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          Мы уже знаем о проблеме. Попробуйте обновить страницу через минуту.
        </p>
        <button type="button" onClick={reset} className={buttonClass("primary", "md", "mt-10")}>
          Попробовать снова
        </button>
      </div>
    </section>
  );
}
