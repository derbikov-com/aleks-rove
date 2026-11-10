import type { MetadataRoute } from "next";
import { getCases, getCategories, getPages, getPosts, getServices, getTags } from "@/lib/cms";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, cases, posts, categories, tags, cmsPages] = await Promise.all([
    getServices(),
    getCases(),
    getPosts(),
    getCategories(),
    getTags(),
    getPages(),
  ]);
  const now = new Date();

  type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];
  const staticPages: [string, Freq, number][] = [
    ["/", "weekly", 1],
    ["/uslugi", "monthly", 0.9],
    ["/keisy", "monthly", 0.8],
    ["/blog", "weekly", 0.7],
    ["/o-kompanii", "yearly", 0.6],
    ["/kontakty", "yearly", 0.6],
    ["/politika-konfidencialnosti", "yearly", 0.2],
  ];
  const pages: MetadataRoute.Sitemap = staticPages.map(([path, changeFrequency, priority]) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));

  return [
    ...pages,
    ...services.map((s) => ({ url: absoluteUrl(`/uslugi/${s.slug}`), lastModified: now, priority: 0.8 })),
    ...cases.map((c) => ({ url: absoluteUrl(`/keisy/${c.slug}`), lastModified: now, priority: 0.7 })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(p.updatedAt ?? p.publishedAt),
      priority: 0.6,
    })),
    ...categories.map((c) => ({ url: absoluteUrl(`/blog/kategoriya/${c.slug}`), lastModified: now, priority: 0.4 })),
    ...tags.map((t) => ({ url: absoluteUrl(`/blog/teg/${t.slug}`), lastModified: now, priority: 0.3 })),
    ...cmsPages
      .filter((p) => p.slug !== "politika-konfidencialnosti")
      .map((p) => ({ url: absoluteUrl(`/${p.slug}`), lastModified: p.updatedAt ? new Date(p.updatedAt) : now, priority: 0.4 })),
  ];
}
