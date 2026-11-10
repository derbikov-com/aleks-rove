import { getSettings } from "@/lib/cms";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";

export async function CtaSection({
  source = "cta-section",
  title = "Расскажите о задаче — предложим решение",
}: {
  source?: string;
  title?: string;
}) {
  const contacts = await getSettings();
  return (
    <section id="zayavka" className="on-dark relative overflow-hidden bg-ink text-white" aria-labelledby="cta-title">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-80 -top-80 h-[56rem] w-[56rem] bg-[radial-gradient(closest-side,rgb(35_72_255/0.45),transparent)]"
        aria-hidden="true"
      />
      <div className="container-x relative grid gap-12 py-20 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:py-28">
        <div>
          <p className="eyebrow">Заявка</p>
          <h2 id="cta-title" className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          <ul className="mt-8 space-y-4 text-white/80">
            {[
              "Ответим в течение рабочего дня",
              "Подготовим оценку сроков и бюджета",
              "Подпишем NDA до обсуждения деталей",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-ink">
                  <Icon name="check" size={16} strokeWidth={2.5} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 space-y-3 border-t border-white/10 pt-8">
            <a
              href={`tel:${contacts.phoneHref}`}
              data-track-location={source}
              className="flex items-center gap-3 text-xl font-bold hover:text-accent sm:text-2xl"
            >
              <Icon name="phone" className="text-accent" />
              {contacts.phone}
            </a>
            <a href={`mailto:${contacts.email}`} className="flex items-center gap-3 text-white/80 hover:text-white">
              <Icon name="mail" className="text-accent" />
              {contacts.email}
            </a>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 text-ink shadow-2xl sm:p-8">
          <ContactForm source={source} variant="page" />
        </div>
      </div>
    </section>
  );
}
