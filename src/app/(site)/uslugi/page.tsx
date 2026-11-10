import { ServiceCard } from "@/components/cards";
import { CtaSection } from "@/components/CtaSection";
import { PageHero } from "@/components/PageHero";
import { getServices } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Услуги",
  description: "Аудит и стратегия, разработка веб-сервисов, автоматизация процессов, интеграции CRM и 1С, BI-аналитика и поддержка по SLA.",
  path: "/uslugi",
  seo: { keywords: ["услуги по разработке", "автоматизация бизнеса", "интеграция систем"] },
});

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Услуги", path: "/uslugi" }]}
        eyebrow="Услуги"
        title="Что мы делаем"
        lead="Закрываем полный цикл цифровых проектов: от аудита и стратегии до разработки, запуска и поддержки по SLA."
      />
      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} />
          ))}
        </div>
      </section>
      <CtaSection source="services-cta" title="Не уверены, с чего начать? Поможем выбрать" />
    </>
  );
}
