import Link from "next/link";
import { getServices } from "@/lib/cms";
import { mainNav, site } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export async function Footer() {
  const services = await getServices();
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-ink text-white/70">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.2fr]">
        <div>
          <Link href="/" aria-label={`${site.name} — на главную`}>
            <Logo light />
          </Link>
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed">{site.description}</p>
        </div>

        <nav aria-label="Разделы сайта">
          <p className="text-sm font-bold uppercase tracking-wider text-white">Компания</p>
          <ul className="mt-5 space-y-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Услуги">
          <p className="text-sm font-bold uppercase tracking-wider text-white">Услуги</p>
          <ul className="mt-5 space-y-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/uslugi/${s.slug}`} className="transition-colors hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white">Контакты</p>
          <ul className="mt-5 space-y-4">
            <li>
              <a
                href={`tel:${site.phoneHref}`}
                data-track-location="footer"
                className="flex items-center gap-3 text-lg font-bold text-white hover:text-accent"
              >
                <Icon name="phone" size={18} className="text-accent" />
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-white">
                <Icon name="mail" size={18} className="text-accent" />
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-accent" />
              <span>
                {site.address.city}, {site.address.street}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="clock" size={18} className="text-accent" />
              {site.workingHours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.foundedYear}–{year} {site.name}
          </p>
          <Link href="/politika-konfidencialnosti" className="hover:text-white">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
