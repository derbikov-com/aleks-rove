import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

// Текстовые страницы из админки: /rekvizity, /dostavka и т.п. Собираются при первом заходе и кэшируются.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.seo?.description ?? page.title,
    path: `/${page.slug}`,
    seo: page.seo,
  });
}

export default async function CmsPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero crumbs={[{ name: page.title, path: `/${page.slug}` }]} title={page.title} />
      <section className="py-12 lg:py-20">
        <div className="container-x">
          <div className="prose-content max-w-3xl" dangerouslySetInnerHTML={{ __html: page.body }} />
        </div>
      </section>
    </>
  );
}
