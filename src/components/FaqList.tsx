import type { Faq } from "@/lib/types";
import { Icon } from "./Icon";
import { JsonLd } from "./JsonLd";

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <>
      <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
        {items.map((item) => (
          <details key={item.question} className="group px-6 sm:px-8 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-bold leading-snug">
              {item.question}
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform group-open:rotate-45 group-open:bg-brand group-open:text-white">
                <Icon name="plus" size={18} />
              </span>
            </summary>
            <p className="max-w-3xl pb-6 leading-relaxed text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
    </>
  );
}
