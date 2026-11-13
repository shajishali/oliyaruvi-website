import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Dialog } from "../ui/Dialog";
import { IconButton } from "../ui/IconButton";
import { textFor, useLocale } from "../../lib/locale";
import { formatPhone, telHref } from "../../lib/phone";
import type { NavItem, SiteSettings } from "../../lib/types";

type Props = {
  settings: SiteSettings;
  items: NavItem[];
};

export function SiteHeader({ settings, items }: Props) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const location = textFor(locale, settings.locationEn, settings.locationTa);

  return (
    <header className="sticky top-0 z-30 border-b border-gold/20 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <NavLink to="/" className="min-w-0 no-underline">
          <span className="block font-heading text-2xl italic text-gold">Oliyaruvi</span>
          <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-muted">Digital Colour Lab</span>
          <span lang="ta" className="mt-1 block font-tamil text-sm text-light-gold">
            {settings.businessNameTa}
          </span>
          <span className="mt-1 block text-xs text-muted">{location}</span>
        </NavLink>

        <nav className="ml-auto hidden items-center gap-4 lg:flex" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="text-sm text-muted no-underline hover:text-light-gold aria-[current=page]:text-gold"
              end={item.href === "/"}
            >
              {textFor(locale, item.labelEn, item.labelTa)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden text-right text-sm leading-6 lg:ml-0 lg:block">
          <a className="block text-ink no-underline" href={telHref(settings.phonePrimary)}>
            {formatPhone(settings.phonePrimary)}
          </a>
          <a className="block text-muted no-underline" href={telHref(settings.phoneSecondary)}>
            {formatPhone(settings.phoneSecondary)}
          </a>
        </div>

        <LanguageSwitch locale={locale} setLocale={setLocale} />
        <div className="lg:hidden">
          <IconButton label="Open menu" onClick={() => setOpen(true)}>
            <span aria-hidden="true">☰</span>
          </IconButton>
        </div>
      </div>

      <p className="border-t border-gold/15 px-4 py-2 text-center text-sm text-muted lg:hidden">
        <a href={telHref(settings.phonePrimary)}>{formatPhone(settings.phonePrimary)}</a>
        <span aria-hidden="true"> · </span>
        <a href={telHref(settings.phoneSecondary)}>{formatPhone(settings.phoneSecondary)}</a>
      </p>

      <Dialog open={open} title="Menu" onClose={() => setOpen(false)}>
        <nav className="grid gap-2" aria-label="Mobile">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="rounded-xl px-3 py-3 text-ink no-underline hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {textFor(locale, item.labelEn, item.labelTa)}
            </NavLink>
          ))}
        </nav>
      </Dialog>
    </header>
  );
}

function LanguageSwitch({ locale, setLocale }: { locale: "en" | "ta"; setLocale: (locale: "en" | "ta") => void }) {
  return (
    <div className="flex rounded-full border border-gold/30 p-1" role="group" aria-label="Language">
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs ${locale === "en" ? "bg-gold text-black" : "text-muted"}`}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 font-tamil text-xs ${locale === "ta" ? "bg-gold text-black" : "text-muted"}`}
        aria-pressed={locale === "ta"}
        onClick={() => setLocale("ta")}
      >
        தமிழ்
      </button>
    </div>
  );
}
