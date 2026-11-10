import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="container-x text-center">
        <p className="text-7xl font-extrabold tracking-tight text-brand sm:text-8xl">404</p>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Страница не найдена</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          Возможно, она была перемещена или удалена. Попробуйте начать с главной или посмотрите наши услуги.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">На главную</ButtonLink>
          <ButtonLink href="/uslugi" variant="outline">
            Услуги
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
