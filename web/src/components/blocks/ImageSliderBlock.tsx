import { useEffect, useState } from "react";
import { asArray, asBoolean, asNumber, asRecord, asString, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { usePrefersReducedMotion } from "../../lib/motion";
import { useResolvedMedia } from "../../lib/use-media";
import { AppLink } from "../ui/AppLink";
import { MediaImage } from "../public/MediaImage";

export function ImageSliderBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const reduced = usePrefersReducedMotion();
  const slides = asArray(content.slides);
  const autoplay = asBoolean(content.autoplay, false) && !reduced;
  const intervalMs = asNumber(content.intervalMs, 5000);
  const [index, setIndex] = useState(0);
  const mediaIds = slides.map((slide) => asString(asRecord(slide).mediaId)).filter(Boolean);
  const media = useResolvedMedia(mediaIds);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [autoplay, intervalMs, slides.length]);

  if (slides.length === 0) {
    return <p className="text-muted">Slider images will appear here after they are added.</p>;
  }

  const slide = asRecord(slides[index]);
  const en = asRecord(slide.en);
  const ta = asRecord(slide.ta);
  const heading = pickLocale(locale, asString(en.heading), asString(ta.heading));
  const href = asString(slide.href);
  const mediaId = asString(slide.mediaId);
  const item = media.find((entry) => entry.id === mediaId);
  const alt = locale === "ta" && item?.altTa ? item.altTa : item?.altEn || heading || "";

  const body = (
    <div className="overflow-hidden rounded-[1.5rem] border border-gold/20 bg-surface/40">
      {item?.url ? (
        <MediaImage
          src={item.url}
          alt={alt}
          className="aspect-[16/9] w-full object-cover"
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 960px"
        />
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center text-sm text-muted">Image pending</div>
      )}
      <div className="p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">
          {index + 1} / {slides.length}
        </p>
        {heading ? <h3 className="mt-2 text-2xl text-ink">{heading}</h3> : null}
      </div>
    </div>
  );

  return href ? <AppLink href={href}>{body}</AppLink> : body;
}
