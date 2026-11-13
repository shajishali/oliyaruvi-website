import { asArray, asBoolean, asString, localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { useResolvedMedia } from "../../lib/use-media";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { MediaImage } from "../public/MediaImage";
import { useSiteSettings } from "../public/PublicLayout";

export function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const heading = localizedField(content, locale, "heading");
  const subheading = localizedField(content, locale, "subheading");
  const body = localizedField(content, locale, "body");
  const primaryLabel = localizedField(content, locale, "primaryLabel");
  const secondaryLabel = localizedField(content, locale, "secondaryLabel");
  const primaryHref = asString(content.primaryHref);
  const secondaryHref = asString(content.secondaryHref);
  const mediaType = asString(content.mediaType, "image");
  const mediaIds = asArray(content.mediaIds).map(String).filter(Boolean);
  const media = useResolvedMedia(mediaIds);
  const first = media[0];
  const autoplay = asBoolean(content.autoplay, false);
  const mute = asBoolean(content.mute, true);
  const loop = asBoolean(content.loop, false);
  const alt = locale === "ta" && first?.altTa ? first.altTa : first?.altEn || heading;

  return (
    <div className="hero-block relative overflow-hidden rounded-[2rem] border border-gold/20 bg-surface/60">
      {first?.kind === "image" ? (
        <MediaImage
          src={first.url}
          alt={alt}
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          sizes="100vw"
        />
      ) : null}
      {first && (mediaType === "video" || first.kind === "video") ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src={first.url}
          autoPlay={autoplay}
          muted={mute}
          loop={loop}
          playsInline
          preload="metadata"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,172,87,0.18),transparent_45%)]" />
      <div className="relative px-6 py-16 md:px-12 md:py-24">
        <div className="max-w-3xl">
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
    </div>
  );
}
