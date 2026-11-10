import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/BlogListing";
import { PageHero } from "@/components/PageHero";
import { getCategories, getPosts, getTags } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/kategoriya/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return pageMetadata({
    title: `${category.name} — статьи блога`,
    description: category.description,
    path: `/blog/kategoriya/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/blog/kategoriya/[slug]">) {
  const { slug } = await params;
  const [categories, tags, posts] = await Promise.all([getCategories(), getTags(), getPosts({ category: slug })]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Блог", path: "/blog" },
          { name: category.name, path: `/blog/kategoriya/${category.slug}` },
        ]}
        eyebrow="Категория"
        title={category.name}
        lead={category.description}
      />
      <BlogListing posts={posts} categories={categories} tags={tags} activeCategory={category.slug} />
    </>
  );
}
