import { localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useSiteSettings } from "../public/PublicLayout";

export function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const heading = localizedField(content, locale, "heading");
  const subheading = localizedField(content, locale, "subheading");
  const body = localizedField(content, locale, "body");
  const primaryLabel = localizedField(content, locale, "primaryLabel");
  const secondaryLabel = localizedField(content, locale, "secondaryLabel");
  const primaryHref = String(content.primaryHref || "");
  const secondaryHref = String(content.secondaryHref || "");

  return (
    <div className="hero-block relative overflow-hidden rounded-[2rem] border border-gold/20 bg-surface/60 px-6 py-16 md:px-12 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,172,87,0.18),transparent_45%)]" />
      <div className="relative max-w-3xl">
        <Badge>{settings.experienceYears} years</Badge>
        <h1 lang={locale} className="mt-6 text-5xl leading-tight text-ink md:text-6xl">
          {heading}
        </h1>
        {subheading ? <p className="mt-6 max-w-xl text-lg text-muted">{subheading}</p> : null}
        {body ? <p className="mt-4 max-w-xl text-muted">{body}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {primaryLabel && primaryHref ? <Button href={primaryHref}>{primaryLabel}</Button> : null}
          {secondaryLabel && secondaryHref ? (
            <Button
              variant={secondaryHref.includes("wa.me") ? "whatsapp" : "outline"}
              href={secondaryHref}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
