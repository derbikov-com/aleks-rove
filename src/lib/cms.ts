// Слой доступа к контенту.
// Если задан BACKEND_API_URL — данные берутся из Java-бэкенда (админка),
// иначе из локальных демонстрационных файлов в src/content.

import { cases } from "@/content/cases";
import { faq } from "@/content/faq";
import { posts } from "@/content/posts";
import { services } from "@/content/services";
import { categories, tags } from "@/content/taxonomy";
import type { CaseStudy, Category, Faq, Post, Service, Tag } from "@/lib/types";

const API = process.env.BACKEND_API_URL?.replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;

async function api<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["cms"] },
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CMS request ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

async function sourceList<T>(path: string, local: () => T[]): Promise<T[]> {
  if (!API) return local();
  return (await api<T[]>(path)) ?? [];
}

async function sourceOne<T>(path: string, local: () => T | undefined): Promise<T | null> {
  if (!API) return local() ?? null;
  return api<T>(path);
}

const byDateDesc = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt);

export const getServices = () => sourceList<Service>("/api/public/services", () => services);
export const getService = (slug: string) =>
  sourceOne<Service>(`/api/public/services/${encodeURIComponent(slug)}`, () => services.find((s) => s.slug === slug));

export const getCases = () => sourceList<CaseStudy>("/api/public/cases", () => cases);
export const getCase = (slug: string) =>
  sourceOne<CaseStudy>(`/api/public/cases/${encodeURIComponent(slug)}`, () => cases.find((c) => c.slug === slug));

export const getCategories = () => sourceList<Category>("/api/public/categories", () => categories);
export const getTags = () => sourceList<Tag>("/api/public/tags", () => tags);
export const getFaq = () => sourceList<Faq>("/api/public/faq", () => faq);

export async function getPosts(filter: { category?: string; tag?: string } = {}): Promise<Post[]> {
  const params = new URLSearchParams();
  if (filter.category) params.set("category", filter.category);
  if (filter.tag) params.set("tag", filter.tag);
  const query = params.size ? `?${params}` : "";
  const list = await sourceList<Post>(`/api/public/posts${query}`, () =>
    posts.filter(
      (p) => (!filter.category || p.category === filter.category) && (!filter.tag || p.tags.includes(filter.tag)),
    ),
  );
  return [...list].sort(byDateDesc);
}

export const getPost = (slug: string) =>
  sourceOne<Post>(`/api/public/posts/${encodeURIComponent(slug)}`, () => posts.find((p) => p.slug === slug));
