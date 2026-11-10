// Типы ответов API бэкенда aleks-rove-back для админки.

export type Role = "ADMIN" | "EDITOR" | "AUTHOR";
export type PostStatus = "DRAFT" | "PUBLISHED";
export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "SPAM";
export type ServiceIcon = "compass" | "code" | "workflow" | "plug" | "chart" | "shield";

export type Me = { id: number; email: string; name?: string; role: Role; superAdmin: boolean };

export type Seo = { title?: string; description?: string; keywords?: string[]; ogImage?: string; noindex?: boolean };
export type Image = { src: string; alt?: string; width?: number; height?: number };
export type Metric = { value: string; label: string };
export type PageResponse<T> = { items: T[]; total: number; page: number; size: number };

export type AdminService = {
  id: string;
  slug: string;
  title: string;
  shortText: string;
  leadText: string;
  icon: ServiceIcon;
  features: string[];
  deliverables: string[];
  duration?: string;
  format?: string;
  position: number;
  published: boolean;
  seo?: Seo;
  updatedAt: string;
};

export type AdminCase = {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  year: number;
  excerpt: string;
  cover?: Image;
  challenge: string;
  solution: string[];
  results: Metric[];
  stack: string[];
  serviceSlugs: string[];
  featured: boolean;
  position: number;
  published: boolean;
  seo?: Seo;
  updatedAt: string;
};

export type AdminPostListItem = {
  id: string;
  slug: string;
  title: string;
  categorySlug?: string;
  status: PostStatus;
  publishedAt?: string;
  createdBy?: number;
  updatedAt: string;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover?: Image;
  categorySlug?: string;
  tagSlugs: string[];
  authorName: string;
  authorRole?: string;
  body: string;
  readingMinutes: number;
  status: PostStatus;
  publishedAt?: string;
  createdBy?: number;
  seo?: Seo;
  updatedAt: string;
};

export type Category = { id: string; slug: string; name: string; description: string; position: number };
export type Tag = { id: string; slug: string; name: string };
export type Faq = { id: string; question: string; answer: string; position: number; published: boolean };
export type AdminPage = { id: string; slug: string; title: string; body: string; published: boolean; seo?: Seo; updatedAt: string };

export type Media = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  alt: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  message?: string;
  source?: string;
  page?: string;
  utm?: Record<string, string>;
  status: LeadStatus;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  id: number;
  email: string;
  name?: string;
  role: Role;
  superAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

export type Settings = {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  leadNotifyEmails: string[];
  updatedAt?: string;
};

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "Администратор", EDITOR: "Редактор", AUTHOR: "Автор" };
export const POST_STATUS_LABEL: Record<PostStatus, string> = { DRAFT: "Черновик", PUBLISHED: "Опубликована" };
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Обработана",
  SPAM: "Спам",
};
