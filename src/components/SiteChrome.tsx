import type { ReactNode } from "react";
import { getSettings } from "@/lib/cms";
import { organizationJsonLd } from "@/lib/seo";
import { Analytics } from "./Analytics";
import { CookieBanner } from "./CookieBanner";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JsonLd } from "./JsonLd";
import { LeadModal } from "./LeadModal";

/** Шапка, подвал и общие виджеты публичного сайта (у админки своя оболочка). */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const contacts = await getSettings();
  return (
    <>
      <Header contacts={contacts} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer contacts={contacts} />
      <LeadModal />
      <CookieBanner />
      <Analytics />
      <JsonLd data={organizationJsonLd(contacts)} />
    </>
  );
}
