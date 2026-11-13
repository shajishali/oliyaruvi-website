import { useEffect, useState } from "react";
import { getTestimonials } from "../../lib/api";
import { asBoolean, asNumber, localizedField, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import type { Testimonial } from "../../lib/types";
import { EmptyState } from "../public/EmptyState";

export function TestimonialsBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const featuredOnly = asBoolean(content.featuredOnly, false);
  const limit = asNumber(content.limit, 3);
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    let alive = true;
    getTestimonials(featuredOnly, limit)
      .then((result) => {
        if (!alive) return;
        setItems(result.testimonials);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
      });
    return () => {
      alive = false;
    };
  }, [featuredOnly, limit]);

  return (
    <div>
      {heading ? <h2 className="mb-6 text-3xl text-ink">{heading}</h2> : null}
      {items.length === 0 ? (
        <EmptyState message="Testimonials will appear here after the studio publishes them." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <blockquote key={item.id} className="card">
              <p className="text-lg text-ink">“{pickLocale(locale, item.quoteEn, item.quoteTa)}”</p>
              <footer className="mt-4 text-sm text-muted">
                {item.personName}
                {item.locationLabel ? ` · ${item.locationLabel}` : ""}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
