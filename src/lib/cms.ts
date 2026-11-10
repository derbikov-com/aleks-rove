// Слой доступа к контенту.
// Если задан BACKEND_API_URL — данные берутся из Java-бэкенда (админка),
// иначе из локальных демонстрационных файлов в src/content.

import { cases } from "@/content/cases";
import { faq } from "@/content/faq";
import { posts } from "@/content/posts";
import { services } from "@/content/services";
import { categories, tags } from "@/content/taxonomy";
import { site } from "@/lib/site";
import type { CaseStudy, Category, CmsPage, Faq, ImageAsset, Post, Service, SiteContacts, Tag } from "@/lib/types";

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

// В админке обложку можно не указать или загрузить без размеров — подставляем безопасные значения
function withCover<T extends { title: string; cover?: Partial<ImageAsset> | null }>(item: T): T & { cover: ImageAsset } {
  const c = item.cover;
  const cover: ImageAsset = c?.src
    ? { src: c.src, alt: c.alt || item.title, width: c.width || 1600, height: c.height || 900 }
    : { src: "/og.png", alt: item.title, width: 1200, height: 630 };
  return { ...item, cover };
}

export const getServices = () => sourceList<Service>("/api/public/services", () => services);
export const getService = (slug: string) =>
  sourceOne<Service>(`/api/public/services/${encodeURIComponent(slug)}`, () => services.find((s) => s.slug === slug));

export const getCases = async () => (await sourceList<CaseStudy>("/api/public/cases", () => cases)).map(withCover);
export const getCase = async (slug: string) => {
  const item = await sourceOne<CaseStudy>(`/api/public/cases/${encodeURIComponent(slug)}`, () =>
    cases.find((c) => c.slug === slug),
  );
  return item ? withCover(item) : null;
};

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
  return list.map(withCover).sort(byDateDesc);
}

export const getPost = async (slug: string) => {
  const post = await sourceOne<Post>(`/api/public/posts/${encodeURIComponent(slug)}`, () =>
    posts.find((p) => p.slug === slug),
  );
  return post ? withCover(post) : null;
};

export const getPage = (slug: string) =>
  sourceOne<CmsPage>(`/api/public/pages/${encodeURIComponent(slug)}`, () => undefined);

export const getPages = () =>
  sourceList<Pick<CmsPage, "slug" | "title" | "updatedAt">>("/api/public/pages", () => []);

const defaultContacts: SiteContacts = {
  companyName: site.name,
  tagline: site.tagline,
  phone: site.phone,
  phoneHref: site.phoneHref,
  email: site.email,
  address: `${site.address.city}, ${site.address.street}`,
  workingHours: site.workingHours,
};

/** Телефон в формате для ссылки tel: — только цифры и плюс, 8 в начале меняем на +7. */
export function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  return digits ? `+${digits}` : "";
}

export async function getSettings(): Promise<SiteContacts> {
  if (!API) return defaultContacts;
  const s = await api<Partial<SiteContacts>>("/api/public/settings");
  if (!s) return defaultContacts;
  const phone = s.phone || defaultContacts.phone;
  return {
    companyName: s.companyName || defaultContacts.companyName,
    tagline: s.tagline || defaultContacts.tagline,
    phone,
    phoneHref: phoneHref(phone),
    email: s.email || defaultContacts.email,
    address: s.address || defaultContacts.address,
    workingHours: s.workingHours || defaultContacts.workingHours,
  };
}
