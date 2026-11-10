import { ContactForm } from "@/components/ContactForm";
import { Icon, type IconKey } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Контакты",
  description: `Свяжитесь с ${site.name}: телефон ${site.phone}, email ${site.email}. Ответим в течение рабочего дня.`,
  path: "/kontakty",
});

export default function ContactsPage() {
  const address = `${site.address.city}, ${site.address.street}`;
  const items: { icon: IconKey; label: string; value: string; href?: string; track?: string }[] = [
    { icon: "phone", label: "Телефон", value: site.phone, href: `tel:${site.phoneHref}`, track: "contacts" },
    { icon: "mail", label: "Email", value: site.email, href: `mailto:${site.email}` },
    {
      icon: "pin",
      label: "Офис",
      value: address,
      href: `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`,
    },
    { icon: "clock", label: "Режим работы", value: site.workingHours },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: `Контакты ${site.name}`,
          url: absoluteUrl("/kontakty"),
          mainEntity: { "@id": absoluteUrl("/#organization") },
        }}
      />
      <PageHero
        crumbs={[{ name: "Контакты", path: "/kontakty" }]}
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        lead="Позвоните, напишите или оставьте заявку — ответим в течение рабочего дня."
      />
      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <ul className="grid content-start gap-4">
            {items.map((item) => {
              const inner = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <Icon name={item.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-muted">{item.label}</span>
                    <span className="mt-0.5 block break-words text-base font-bold sm:text-lg">{item.value}</span>
                  </span>
                </>
              );
              const cls = "flex items-center gap-4 rounded-[var(--radius-card)] border border-line p-5";
              return (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={`${cls} transition-colors hover:border-brand/40`}
                      data-track-location={item.track}
                      {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-lift)] sm:p-10">
            <h2 className="text-2xl font-extrabold tracking-tight">Оставить заявку</h2>
            <p className="mt-2 text-muted">Расскажите коротко о задаче — подготовим вопросы и предварительную оценку.</p>
            <div className="mt-8">
              <ContactForm source="contacts-page" variant="page" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
