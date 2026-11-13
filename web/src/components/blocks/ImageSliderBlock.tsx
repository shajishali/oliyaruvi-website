import { useEffect, useState } from "react";
import { asArray, asBoolean, asNumber, asRecord, asString, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { usePrefersReducedMotion } from "../../lib/motion";
import { AppLink } from "../ui/AppLink";

export function ImageSliderBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const reduced = usePrefersReducedMotion();
  const slides = asArray(content.slides);
  const autoplay = asBoolean(content.autoplay, false) && !reduced;
  const intervalMs = asNumber(content.intervalMs, 5000);
  const [index, setIndex] = useState(0);

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

  const body = (
    <div className="card min-h-[16rem]">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">
        {index + 1} / {slides.length}
      </p>
      {heading ? <h3 className="mt-4 text-3xl text-ink">{heading}</h3> : null}
      <p className="mt-3 text-sm text-muted">Image media will appear here after upload.</p>
    </div>
  );

  return href ? <AppLink href={href}>{body}</AppLink> : body;
}
