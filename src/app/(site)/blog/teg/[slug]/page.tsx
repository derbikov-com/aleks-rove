import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/BlogListing";
import { PageHero } from "@/components/PageHero";
import { getCategories, getPosts, getTags } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/teg/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tag = (await getTags()).find((t) => t.slug === slug);
  if (!tag) return {};
  return pageMetadata({
    title: `Статьи с меткой «${tag.name}»`,
    description: `Подборка статей блога по теме «${tag.name}».`,
    path: `/blog/teg/${tag.slug}`,
  });
}

export default async function TagPage({ params }: PageProps<"/blog/teg/[slug]">) {
  const { slug } = await params;
  const [categories, tags, posts] = await Promise.all([getCategories(), getTags(), getPosts({ tag: slug })]);
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Блог", path: "/blog" },
          { name: `#${tag.name}`, path: `/blog/teg/${tag.slug}` },
        ]}
        eyebrow="Метка"
        title={`#${tag.name}`}
        lead={`Все статьи по теме «${tag.name}».`}
      />
      <BlogListing posts={posts} categories={categories} tags={tags} activeTag={tag.slug} />
    </>
  );
}
