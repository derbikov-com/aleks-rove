import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";
import type { Seo, SiteContacts } from "@/lib/types";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  seo?: Seo;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** не добавлять « | Название сайта» к заголовку */
  absoluteTitle?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  seo,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  absoluteTitle = false,
}: PageMetaInput): Metadata {
  const metaTitle = seo?.title ?? title;
  const metaDescription = seo?.description ?? description;
  const ogImage = seo?.ogImage ?? image ?? "/og.png";

  return {
    title: absoluteTitle ? { absolute: metaTitle } : metaTitle,
    description: metaDescription,
    keywords: seo?.keywords,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: metaTitle,
      description: metaDescription,
      images: [{ url: ogImage, alt: metaTitle }],
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
    ...(seo?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function organizationJsonLd(c: SiteContacts) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: c.companyName,
    url: site.url,
    logo: absoluteUrl("/logo.png"),
    email: c.email,
    telephone: c.phoneHref,
    foundingDate: String(site.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressCountry: site.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: c.phoneHref,
      email: c.email,
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: ["Russian"],
    },
  };
}
