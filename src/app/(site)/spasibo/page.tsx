import { Icon } from "@/components/Icon";
import { ButtonLink } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/cms";

export const metadata = pageMetadata({
  title: "Заявка отправлена",
  description: "Спасибо за обращение. Мы свяжемся с вами в течение рабочего дня.",
  path: "/spasibo",
  seo: { noindex: true },
});

export default async function ThanksPage() {
  const contacts = await getSettings();
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-lift)] sm:p-14">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-ink">
            <Icon name="check" size={32} strokeWidth={2.5} />
          </span>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Спасибо, заявка отправлена!</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Мы свяжемся с вами в течение рабочего дня. Если вопрос срочный — позвоните по номеру{" "}
            <a href={`tel:${contacts.phoneHref}`} data-track-location="thanks" className="font-bold text-ink hover:text-brand">
              {contacts.phone}
            </a>
            .
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/keisy" variant="primary">
              Посмотреть кейсы
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              На главную
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
