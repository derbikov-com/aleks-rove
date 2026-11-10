import Image from "next/image";
import Link from "next/link";
import type { CaseStudy, Category, Post, Service } from "@/lib/types";
import { Icon } from "./Icon";
import { formatDate } from "./ui";

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <Link
      href={`/uslugi/${service.slug}`}
      className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-card)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-lift)] sm:p-7"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
          <Icon name={service.icon} />
        </span>
        {index !== undefined && (
          <span className="text-sm font-bold tabular-nums text-ink/25">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <h3 className="mt-6 text-xl font-bold leading-snug tracking-tight">{service.title}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted">{service.short}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand">
        Подробнее
        <Icon name="arrowRight" size={18} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function CaseCard({ item, priority = false }: { item: CaseStudy; priority?: boolean }) {
  const top = item.results[0];
  return (
    <Link href={`/keisy/${item.slug}`} className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-paper">
        <Image
          src={item.cover.src}
          alt={item.cover.alt}
          width={item.cover.width}
          height={item.cover.height}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {top && (
          <span className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-2.5 shadow-[var(--shadow-card)] backdrop-blur">
            <span className="block text-xl font-extrabold leading-none text-brand">{top.value}</span>
            <span className="mt-1 block text-xs font-medium text-muted">{top.label}</span>
          </span>
        )}
      </div>
      <p className="mt-5 text-sm font-semibold text-muted">
        {item.industry} · {item.year}
      </p>
      <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-brand">
        {item.title}
      </h3>
      <p className="mt-3 leading-relaxed text-muted">{item.excerpt}</p>
    </Link>
  );
}

export function PostCard({ post, category }: { post: Post; category?: Category }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-paper">
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          width={post.cover.width}
          height={post.cover.height}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {category && <span className="font-semibold text-brand">{category.name}</span>}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingMinutes} мин</span>
      </div>
      <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-brand">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 leading-relaxed text-muted">{post.excerpt}</p>
    </article>
  );
}
