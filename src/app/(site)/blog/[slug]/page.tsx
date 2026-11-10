import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PostCard } from "@/components/cards";
import { JsonLd } from "@/components/JsonLd";
import { OpenLeadButton } from "@/components/OpenLeadButton";
import { formatDate } from "@/components/ui";
import { getCategories, getPost, getPosts, getTags } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    seo: post.seo,
    image: post.cover.src,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt ?? post.publishedAt,
  });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, categories, tags] = await Promise.all([getPost(slug), getCategories(), getTags()]);
  if (!post) notFound();

  const category = categories.find((c) => c.slug === post.category);
  const postTags = tags.filter((t) => post.tags.includes(t.slug));
  const related = (await getPosts({ category: post.category })).filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: absoluteUrl(post.cover.src),
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          author: { "@type": "Organization", name: post.author.name, url: site.url },
          publisher: { "@id": absoluteUrl("/#organization") },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          articleSection: category?.name,
          keywords: postTags.map((t) => t.name).join(", "),
          inLanguage: "ru-RU",
        }}
      />
      <article>
        <header className="bg-paper">
          <div className="container-x pb-12 pt-8 sm:pt-10">
            <Breadcrumbs
              items={[
                { name: "Блог", path: "/blog" },
                ...(category ? [{ name: category.name, path: `/blog/kategoriya/${category.slug}` }] : []),
                { name: post.title, path: `/blog/${post.slug}` },
              ]}
            />
            <div className="mx-auto mt-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                {category && (
                  <Link href={`/blog/kategoriya/${category.slug}`} className="font-semibold text-brand hover:underline">
                    {category.name}
                  </Link>
                )}
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} мин чтения</span>
              </div>
              <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-balance sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{post.excerpt}</p>
            </div>
          </div>
        </header>

        <div className="container-x">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            sizes="(min-width: 1024px) 960px, 100vw"
            priority
            className="mx-auto -mt-1 aspect-[16/9] w-full max-w-5xl rounded-b-3xl object-cover sm:rounded-3xl lg:mt-0"
          />
          <div className="prose-content mx-auto max-w-3xl py-12 lg:py-16" dangerouslySetInnerHTML={{ __html: post.body }} />

          <footer className="mx-auto max-w-3xl border-t border-line pb-16 pt-8">
            {postTags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Метки статьи">
                {postTags.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/blog/teg/${t.slug}`}
                      className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-sm font-medium hover:border-ink/40"
                    >
                      #{t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="on-dark mt-10 flex flex-col gap-6 rounded-[var(--radius-card)] bg-ink p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xl font-extrabold">Нужна помощь с похожей задачей?</p>
                <p className="mt-2 text-white/70">Расскажите о проекте — предложим решение и оценку.</p>
              </div>
              <OpenLeadButton source={`post:${post.slug}`} className="shrink-0" />
            </div>
          </footer>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-paper py-16 lg:py-24" aria-labelledby="related-title">
          <div className="container-x">
            <h2 id="related-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Читайте также
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
