import { CaseCard } from "@/components/cards";
import { CtaSection } from "@/components/CtaSection";
import { PageHero } from "@/components/PageHero";
import { getCases } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Кейсы",
  description: "Проекты по разработке, автоматизации и аналитике с измеримыми результатами: B2B-порталы, автоматизация склада, BI-отчётность.",
  path: "/keisy",
  seo: { keywords: ["кейсы автоматизации", "портфолио разработки", "примеры проектов"] },
});

export default async function CasesPage() {
  const cases = await getCases();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Кейсы", path: "/keisy" }]}
        eyebrow="Кейсы"
        title="Проекты и результаты"
        lead="Каждый кейс — с цифрами до и после. Названия клиентов скрыты по условиям NDA, детали расскажем на встрече."
      />
      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-x-8 gap-y-14 sm:grid-cols-2">
          {cases.map((c, i) => (
            <CaseCard key={c.slug} item={c} priority={i < 2} />
          ))}
        </div>
      </section>
      <CtaSection source="cases-cta" title="Хотите такой же результат? Обсудим вашу задачу" />
    </>
  );
}
