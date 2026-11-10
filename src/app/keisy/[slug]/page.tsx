import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseCard } from "@/components/cards";
import { CtaSection } from "@/components/CtaSection";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { getCase, getCases, getServices } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const cases = await getCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/keisy/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) return {};
  return pageMetadata({
    title: item.title,
    description: item.excerpt,
    path: `/keisy/${item.slug}`,
    seo: item.seo,
    image: item.cover.src,
  });
}

export default async function CasePage({ params }: PageProps<"/keisy/[slug]">) {
  const { slug } = await params;
  const [item, cases, services] = await Promise.all([getCase(slug), getCases(), getServices()]);
  if (!item) notFound();

  const usedServices = services.filter((s) => item.services.includes(s.slug));
  const others = cases.filter((c) => c.slug !== item.slug).slice(0, 2);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: item.title,
          description: item.excerpt,
          image: absoluteUrl(item.cover.src),
          url: absoluteUrl(`/keisy/${item.slug}`),
          author: { "@id": absoluteUrl("/#organization") },
          publisher: { "@id": absoluteUrl("/#organization") },
          about: item.industry,
        }}
      />
      <PageHero
        crumbs={[
          { name: "Кейсы", path: "/keisy" },
          { name: item.title, path: `/keisy/${item.slug}` },
        ]}
        eyebrow={`${item.industry} · ${item.year}`}
        title={item.title}
        lead={item.excerpt}
      />

      <section className="pt-12 lg:pt-16">
        <div className="container-x">
          <Image
            src={item.cover.src}
            alt={item.cover.alt}
            width={item.cover.width}
            height={item.cover.height}
            sizes="(min-width: 1280px) 1216px, 100vw"
            priority
            className="aspect-[16/9] w-full rounded-3xl object-cover sm:aspect-[21/9]"
          />
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {item.results.map((r) => (
              <div key={r.label} className="flex flex-col-reverse rounded-[var(--radius-card)] bg-paper p-6 sm:p-7">
                <dt className="mt-2 text-muted">{r.label}</dt>
                <dd className="text-4xl font-extrabold tracking-tight text-brand">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Задача</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">{item.challenge}</p>
            <h2 className="mt-14 text-2xl font-extrabold tracking-tight sm:text-3xl">Что сделали</h2>
            <ol className="mt-6 space-y-5">
              {item.solution.map((step, i) => (
                <li key={step} className="flex gap-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-accent">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-lg leading-relaxed text-ink-2">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
              <div className="p-6">
                <dt className="text-sm text-muted">Клиент</dt>
                <dd className="mt-1 font-bold">{item.client}</dd>
              </div>
              <div className="p-6">
                <dt className="text-sm text-muted">Отрасль и год</dt>
                <dd className="mt-1 font-bold">
                  {item.industry}, {item.year}
                </dd>
              </div>
              {usedServices.length > 0 && (
                <div className="p-6">
                  <dt className="text-sm text-muted">Услуги</dt>
                  <dd className="mt-2 flex flex-col gap-2">
                    {usedServices.map((s) => (
                      <Link key={s.slug} href={`/uslugi/${s.slug}`} className="font-semibold text-brand hover:underline">
                        {s.title}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
              <div className="p-6">
                <dt className="text-sm text-muted">Технологии</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {item.stack.map((t) => (
                    <span key={t} className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-paper py-16 lg:py-24">
          <div className="container-x">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Другие кейсы</h2>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2">
              {others.map((c) => (
                <CaseCard key={c.slug} item={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection source={`case-cta:${item.slug}`} title="Хотите похожий результат? Расскажите о задаче" />
    </>
  );
}
