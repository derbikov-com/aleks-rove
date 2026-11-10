import Link from "next/link";
import { CaseCard, PostCard, ServiceCard } from "@/components/cards";
import { CtaSection } from "@/components/CtaSection";
import { FaqList } from "@/components/FaqList";
import { Icon, type IconKey } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { OpenLeadButton } from "@/components/OpenLeadButton";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { getCases, getCategories, getFaq, getPosts, getServices } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
  seo: { keywords: [...site.keywords] },
});

const advantages: { icon: IconKey; title: string; text: string }[] = [
  {
    icon: "target",
    title: "Считаем эффект до старта",
    text: "Каждую инициативу оцениваем в часах, рублях и ошибках — и сверяем результат после запуска.",
  },
  {
    icon: "repeat",
    title: "Демо каждые две недели",
    text: "Вы видите работающий продукт, а не отчёты о прогрессе, и можете менять приоритеты по ходу.",
  },
  {
    icon: "key",
    title: "Код и доступы — ваши",
    text: "Репозиторий, документация и инфраструктура принадлежат заказчику с первого дня.",
  },
  {
    icon: "lifebuoy",
    title: "Поддержка по SLA",
    text: "После запуска не исчезаем: мониторинг, обновления и развитие по понятным правилам.",
  },
];

const steps = [
  { title: "Бриф и оценка", text: "Разбираем задачу и готовим оценку сроков и бюджета.", time: "1–3 дня" },
  { title: "Аудит и проектирование", text: "Интервью, карта процессов, прототипы и архитектура.", time: "1–3 недели" },
  { title: "Разработка", text: "Спринты по две недели с демо работающего функционала.", time: "от 4 недель" },
  { title: "Запуск и пилот", text: "Запуск на группе пользователей, обучение и доработки.", time: "1–2 недели" },
  { title: "Поддержка", text: "SLA, мониторинг и развитие по согласованному бэклогу.", time: "постоянно" },
];

export default async function HomePage() {
  const [services, cases, posts, categories, faq] = await Promise.all([
    getServices(),
    getCases(),
    getPosts(),
    getCategories(),
    getFaq(),
  ]);
  const featured = (cases.some((c) => c.featured) ? cases.filter((c) => c.featured) : cases).slice(0, 3);
  const years = new Date().getFullYear() - site.foundedYear;

  const stats = [
    { value: `${years}`, label: "лет на рынке" },
    { value: "120+", label: "запущенных проектов" },
    { value: "35", label: "специалистов в команде" },
    { value: "92%", label: "клиентов остаются на поддержке" },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          inLanguage: "ru-RU",
          publisher: { "@id": absoluteUrl("/#organization") },
        }}
      />

      {/* Первый экран */}
      <section className="on-dark relative overflow-hidden bg-ink text-white">
        <div
          className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_70%_20%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="absolute -right-32 -top-48 h-[36rem] w-[36rem] rounded-full bg-brand/45 blur-[140px]" aria-hidden="true" />
        <div className="absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" aria-hidden="true" />

        <div className="container-x relative grid items-center gap-14 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:pb-24 lg:pt-24">
          <div>
            <p className="eyebrow">{site.tagline}</p>
            <h1 className="mt-5 text-[2.125rem] font-extrabold leading-[1.06] tracking-tight text-balance min-[400px]:text-[2.5rem] sm:text-6xl lg:text-[4rem]">
              Превращаем процессы компании в <span className="text-accent">цифровые сервисы</span>, которые окупаются
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Аудит, разработка, автоматизация и аналитика под ключ. Считаем эффект до старта и отвечаем за результат после
              запуска.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <OpenLeadButton source="hero" size="lg">
                Обсудить проект
                <Icon name="arrowRight" size={18} />
              </OpenLeadButton>
              <ButtonLink href="/keisy" variant="outlineLight" size="lg" data-track="cta_click" data-track-label="hero-cases">
                Смотреть кейсы
              </ButtonLink>
            </div>
          </div>

          <HeroPanel />
        </div>

        <div className="relative border-t border-white/10">
          <dl className="container-x grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse pr-4">
                <dt className="mt-1 text-sm text-white/60 sm:text-[0.9375rem]">{s.label}</dt>
                <dd className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Услуги */}
      <section className="py-20 lg:py-28" aria-labelledby="services-title">
        <div className="container-x">
          <SectionHeading
            eyebrow="Услуги"
            title={<span id="services-title">Закрываем полный цикл — от идеи до поддержки</span>}
            lead="Можно начать с одной услуги и расширять сотрудничество по мере результатов."
            action={
              <ButtonLink href="/uslugi" variant="outline">
                Все услуги <Icon name="arrowRight" size={18} />
              </ButtonLink>
            }
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="bg-paper py-20 lg:py-28" aria-labelledby="why-title">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Почему мы</p>
            <h2 id="why-title" className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-balance sm:text-4xl">
              Отвечаем за результат, а не за количество часов
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Мы работаем с компаниями, которым важен измеримый эффект: меньше ручной работы, быстрее процессы, прозрачные
              цифры для решений.
            </p>
            <ButtonLink href="/o-kompanii" variant="dark" className="mt-8">
              О компании
            </ButtonLink>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {advantages.map((a) => (
              <li key={a.title} className="rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-accent">
                  <Icon name={a.icon} />
                </span>
                <h3 className="mt-6 text-xl font-bold tracking-tight">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Кейсы */}
      <section className="py-20 lg:py-28" aria-labelledby="cases-title">
        <div className="container-x">
          <SectionHeading
            eyebrow="Кейсы"
            title={<span id="cases-title">Результаты, которые можно измерить</span>}
            action={
              <ButtonLink href="/keisy" variant="outline">
                Все кейсы <Icon name="arrowRight" size={18} />
              </ButtonLink>
            }
          />
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CaseCard key={c.slug} item={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Как работаем */}
      <section className="on-dark bg-ink-2 py-20 text-white lg:py-28" aria-labelledby="process-title">
        <div className="container-x">
          <p className="eyebrow">Как работаем</p>
          <h2 id="process-title" className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
            Прозрачный процесс без сюрпризов в конце
          </h2>
          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-base font-extrabold text-ink">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-white/15 lg:block" aria-hidden="true" />}
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-white/65">{s.text}</p>
                <p className="mt-3 text-sm font-semibold text-accent">{s.time}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Блог */}
      {posts.length > 0 && (
        <section className="py-20 lg:py-28" aria-labelledby="blog-title">
          <div className="container-x">
            <SectionHeading
              eyebrow="Блог"
              title={<span id="blog-title">Делимся опытом</span>}
              action={
                <ButtonLink href="/blog" variant="outline">
                  Все статьи <Icon name="arrowRight" size={18} />
                </ButtonLink>
              }
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((p) => (
                <PostCard key={p.slug} post={p} category={categories.find((c) => c.slug === p.category)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="bg-paper py-20 lg:py-28" aria-labelledby="faq-title">
          <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16">
            <div>
              <p className="eyebrow">Вопросы</p>
              <h2 id="faq-title" className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
                Частые вопросы
              </h2>
              <p className="mt-5 leading-relaxed text-muted">
                Не нашли ответ? <Link href="/kontakty" className="font-semibold text-brand underline underline-offset-4">Напишите нам</Link> — ответим в течение рабочего дня.
              </p>
            </div>
            <FaqList items={faq} />
          </div>
        </section>
      )}

      <CtaSection source="home-cta" />
    </>
  );
}

function HeroPanel() {
  const rows = [
    { label: "Время обработки заказа", value: "−42%", width: "58%" },
    { label: "Ручной ввод данных", value: "−80%", width: "20%" },
    { label: "Скорость отгрузки", value: "+18%", width: "86%" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md lg:mr-0" aria-hidden="true">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-md sm:p-7">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white/80">Эффект после запуска</p>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
            <span className="h-2 w-2 rounded-full bg-accent" />
            онлайн
          </span>
        </div>
        <svg viewBox="0 0 320 110" className="mt-6 w-full" role="presentation">
          <defs>
            <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2348FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#2348FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 92 L40 84 L80 88 L120 66 L160 70 L200 48 L240 40 L280 22 L320 14 L320 110 L0 110 Z" fill="url(#hero-area)" />
          <path
            d="M0 92 L40 84 L80 88 L120 66 L160 70 L200 48 L240 40 L280 22 L320 14"
            fill="none"
            stroke="#C8F04A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="320" cy="14" r="5" fill="#C8F04A" />
        </svg>
        <div className="mt-6 space-y-5">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-white/65">{r.label}</span>
                <span className="text-lg font-extrabold text-white">{r.value}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: r.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-xl sm:-left-8">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent">
          <Icon name="check" size={18} strokeWidth={2.5} />
        </span>
        <span>
          <span className="block text-sm font-extrabold">MVP за 6 недель</span>
          <span className="block text-xs text-muted">демо каждые 2 недели</span>
        </span>
      </div>
    </div>
  );
}
