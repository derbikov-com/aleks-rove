import type { ReactNode } from "react";
import type { Crumb } from "@/lib/seo";
import { Breadcrumbs } from "./Breadcrumbs";

export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="container-x pb-12 pt-8 sm:pb-16 sm:pt-10">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 max-w-3xl sm:mt-10">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl">{title}</h1>
          {lead && <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
