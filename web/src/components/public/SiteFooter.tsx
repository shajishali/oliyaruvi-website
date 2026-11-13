import { AppLink } from "../ui/AppLink";
import { textFor, useLocale } from "../../lib/locale";
import { formatPhone, telHref } from "../../lib/phone";
import type { NavItem, SiteSettings } from "../../lib/types";

type Props = {
  settings: SiteSettings;
  items: NavItem[];
};

export function SiteFooter({ settings, items }: Props) {
  const { locale } = useLocale();
  const social = settings.socialLinks.filter((link) => /^https?:\/\//.test(link.url));

  return (
    <footer className="border-t border-gold/20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-section md:grid-cols-3 md:px-6">
        <div>
          <p className="font-heading text-2xl italic text-gold">Oliyaruvi</p>
          <p lang="ta" className="mt-2 font-tamil text-light-gold">
            {settings.businessNameTa}
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            {settings.businessName}. {textFor(locale, settings.locationEn, settings.locationTa)}
          </p>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-[0.16em] text-gold">Services</h2>
          <ul className="mt-3 grid gap-2">
            {items.map((item) => (
              <li key={item.href}>
                <AppLink className="text-sm text-muted no-underline hover:text-ink" href={item.href}>
                  {textFor(locale, item.labelEn, item.labelTa)}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-muted">
          <h2 className="text-sm uppercase tracking-[0.16em] text-gold">Contact</h2>
          <p className="mt-3">
            <a href={telHref(settings.phonePrimary)}>{formatPhone(settings.phonePrimary)}</a>
          </p>
          <p>
            <a href={telHref(settings.phoneSecondary)}>{formatPhone(settings.phoneSecondary)}</a>
          </p>
          <p className="mt-4">
            {settings.hours == null
              ? "Business hours will appear here after the studio adds them."
              : "Business hours are saved in the studio settings."}
          </p>
          {social.length === 0 ? (
            <p className="mt-4">Social links will appear here after the studio adds them.</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {social.map((link) => (
                <li key={link.url}>
                  <a href={link.url} rel="noreferrer" target="_blank">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
