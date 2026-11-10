import { BlogListing } from "@/components/BlogListing";
import { PageHero } from "@/components/PageHero";
import { getCategories, getPosts, getTags } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Блог",
  description: "Статьи о разработке, автоматизации бизнес-процессов, интеграциях и аналитике — из практики наших проектов.",
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories, tags] = await Promise.all([getPosts(), getCategories(), getTags()]);
  return (
    <>
      <PageHero
        crumbs={[{ name: "Блог", path: "/blog" }]}
        eyebrow="Блог"
        title="Делимся опытом"
        lead="Практические заметки о разработке, автоматизации и аналитике — без воды и рекламы."
      />
      <BlogListing posts={posts} categories={categories} tags={tags} />
    </>
  );
}
