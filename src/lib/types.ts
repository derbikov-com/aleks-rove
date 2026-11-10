// Модель контента. Тот же контракт должен отдавать Java-бэкенд (см. docs/backend-api.md).

export type Seo = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
};

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type IconName = "compass" | "code" | "workflow" | "plug" | "chart" | "shield";

export type Service = {
  slug: string;
  title: string;
  short: string;
  lead: string;
  icon: IconName;
  features: string[];
  deliverables: string[];
  duration: string;
  format: string;
  seo?: Seo;
};

export type Metric = { value: string; label: string };

export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  year: number;
  excerpt: string;
  cover: ImageAsset;
  challenge: string;
  solution: string[];
  results: Metric[];
  stack: string[];
  services: string[];
  featured?: boolean;
  seo?: Seo;
};

export type Category = { slug: string; name: string; description: string };
export type Tag = { slug: string; name: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  cover: ImageAsset;
  category: string;
  tags: string[];
  author: { name: string; role: string };
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  /** HTML из визуального редактора админки */
  body: string;
  seo?: Seo;
};

export type Faq = { question: string; answer: string };
