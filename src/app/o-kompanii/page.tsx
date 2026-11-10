import { CtaSection } from "@/components/CtaSection";
import { Icon, type IconKey } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "О компании",
  description: `${site.name} — команда аналитиков, дизайнеров и инженеров. С ${site.foundedYear} года помогаем бизнесу автоматизировать процессы и запускать цифровые сервисы.`,
  path: "/o-kompanii",
});

const principles: { icon: IconKey; title: string; text: string }[] = [
  { icon: "target", title: "Сначала цель, потом технологии", text: "Выбираем решения под задачу бизнеса, а не под модный стек." },
  { icon: "repeat", title: "Короткие итерации", text: "Показываем результат каждые две недели и корректируем курс вместе с вами." },
  { icon: "key", title: "Прозрачность", text: "Открытый бэклог, понятные оценки и отчёты, доступ к репозиторию и задачам." },
  { icon: "shield", title: "Надёжность", text: "Тесты, мониторинг, резервные копии и документация — стандарт, а не опция." },
];

const team = [
  { value: "6", label: "бизнес-аналитиков" },
  { value: "4", label: "дизайнера" },
  { value: "18", label: "разработчиков" },
  { value: "4", label: "инженера по тестированию" },
  { value: "3", label: "руководителя проектов" },
];

export default function AboutPage() {
  const years = new Date().getFullYear() - site.foundedYear;
  return (
    <>
      <PageHero
        crumbs={[{ name: "О компании", path: "/o-kompanii" }]}
        eyebrow="О компании"
        title={`Помогаем бизнесу расти с помощью технологий с ${site.foundedYear} года`}
        lead="Мы — команда аналитиков, дизайнеров и инженеров. Беремся за задачи, где важен измеримый результат, и остаёмся рядом после запуска."
      />

      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-ink-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Наша история</h2>
            <p>
              Компания начиналась с небольшой команды, которая автоматизировала учёт для дистрибьюторов. За {years} лет мы
              выросли до 35 специалистов и запустили более 120 проектов для торговли, производства, медицины и сферы услуг.
            </p>
            <p>
              Мы не продаём «универсальные решения». Каждый проект начинаем с аудита и расчёта эффекта, чтобы заказчик заранее
              понимал, за что платит и когда вложения окупятся.
            </p>
            <p>Большинство клиентов остаются с нами на поддержке и развитии — для нас это главный показатель качества.</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-paper p-7 sm:p-10">
            <h2 className="text-xl font-extrabold">Команда</h2>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {team.map((t) => (
                <div key={t.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-muted">{t.label}</dt>
                  <dd className="text-4xl font-extrabold tracking-tight text-brand">{t.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href="/keisy" variant="dark" className="mt-10">
              Посмотреть кейсы
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24" aria-labelledby="principles-title">
        <div className="container-x">
          <p className="eyebrow">Принципы</p>
          <h2 id="principles-title" className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
            Как мы работаем
          </h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <li key={p.title} className="rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Icon name={p.icon} />
                </span>
                <h3 className="mt-6 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection source="about-cta" title="Давайте обсудим, чем мы можем быть полезны" />
    </>
  );
}
