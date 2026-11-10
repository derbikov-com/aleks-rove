import Link from "next/link";
import type { Category, Post, Tag } from "@/lib/types";
import { PostCard } from "./cards";
import { cn } from "./ui";

export function BlogListing({
  posts,
  categories,
  tags,
  activeCategory,
  activeTag,
}: {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  activeCategory?: string;
  activeTag?: string;
}) {
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center rounded-full px-4 text-[0.9375rem] font-semibold transition-colors",
      active ? "bg-ink text-white" : "bg-paper text-ink hover:bg-line",
    );

  return (
    <section className="py-12 lg:py-20">
      <div className="container-x">
        <nav aria-label="Категории блога">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/blog" className={chip(!activeCategory && !activeTag)} aria-current={!activeCategory && !activeTag ? "page" : undefined}>
                Все статьи
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/blog/kategoriya/${c.slug}`}
                  className={chip(activeCategory === c.slug)}
                  aria-current={activeCategory === c.slug ? "page" : undefined}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {posts.length > 0 ? (
          <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} category={categories.find((c) => c.slug === p.category)} />
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-2xl bg-paper p-8 text-center text-muted">В этом разделе пока нет статей.</p>
        )}

        {tags.length > 0 && (
          <nav aria-label="Метки" className="mt-20 border-t border-line pt-10">
            <p className="text-sm font-bold uppercase tracking-wider text-muted">Метки</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/blog/teg/${t.slug}`}
                    aria-current={activeTag === t.slug ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
                      activeTag === t.slug ? "border-brand bg-brand text-white" : "border-line hover:border-ink/40",
                    )}
                  >
                    #{t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
