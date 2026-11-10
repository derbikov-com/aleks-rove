import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseCard, ServiceCard } from "@/components/cards";
import { CtaSection } from "@/components/CtaSection";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { OpenLeadButton } from "@/components/OpenLeadButton";
import { PageHero } from "@/components/PageHero";
import { getCases, getService, getServices } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/uslugi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.title,
    description: service.lead,
    path: `/uslugi/${service.slug}`,
    seo: service.seo,
  });
}

export default async function ServicePage({ params }: PageProps<"/uslugi/[slug]">) {
  const { slug } = await params;
  const [service, services, cases] = await Promise.all([getService(slug), getServices(), getCases()]);
  if (!service) notFound();

  const related = cases.filter((c) => c.services.includes(service.slug)).slice(0, 2);
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.lead,
          url: absoluteUrl(`/uslugi/${service.slug}`),
          provider: { "@id": absoluteUrl("/#organization") },
          areaServed: { "@type": "Country", name: "Россия" },
        }}
      />
      <PageHero
        crumbs={[
          { name: "Услуги", path: "/uslugi" },
          { name: service.title, path: `/uslugi/${service.slug}` },
        ]}
        eyebrow="Услуга"
        title={service.title}
        lead={service.lead}
      >
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <OpenLeadButton source={`service:${service.slug}`} size="lg">
            Обсудить задачу
          </OpenLeadButton>
          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted">Сроки</dt>
              <dd className="font-bold">{service.duration}</dd>
            </div>
            <div>
              <dt className="text-muted">Формат</dt>
              <dd className="font-bold">{service.format}</dd>
            </div>
          </dl>
        </div>
      </PageHero>

      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Что входит в работу</h2>
            <ul className="mt-8 space-y-4">
              {service.features.map((f) => (
                <li key={f} className="flex gap-4 rounded-2xl border border-line p-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                    <Icon name="check" size={18} strokeWidth={2.25} />
                  </span>
                  <span className="pt-0.5 text-lg leading-snug">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="on-dark rounded-[var(--radius-card)] bg-ink p-7 text-white sm:p-8">
              <h2 className="text-xl font-extrabold">Что вы получите</h2>
              <ul className="mt-6 space-y-4">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-white/80">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
              <OpenLeadButton source={`service-aside:${service.slug}`} className="mt-8 w-full">
                Получить оценку
              </OpenLeadButton>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper py-16 lg:py-24">
          <div className="container-x">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Кейсы по этой услуге</h2>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2">
              {related.map((c) => (
                <CaseCard key={c.slug} item={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-24">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Другие услуги</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection source={`service-cta:${service.slug}`} />
    </>
  );
}
