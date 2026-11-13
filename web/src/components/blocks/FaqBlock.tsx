import { useEffect, useState } from "react";
import { getFaqs } from "../../lib/api";
import { asNumber, localizedField, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import type { Faq } from "../../lib/types";
import { EmptyState } from "../public/EmptyState";

export function FaqBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const limit = asNumber(content.limit, 20);
  const [items, setItems] = useState<Faq[]>([]);

  useEffect(() => {
    let alive = true;
    getFaqs(limit)
      .then((result) => {
        if (!alive) return;
        setItems(result.faqs);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
      });
    return () => {
      alive = false;
    };
  }, [limit]);

  return (
    <div>
      {heading ? <h2 className="mb-6 text-3xl text-ink">{heading}</h2> : null}
      {items.length === 0 ? (
        <EmptyState message="FAQs will appear here after the studio publishes them." />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <details key={item.id} className="card">
              <summary className="cursor-pointer text-lg text-ink">
                {pickLocale(locale, item.questionEn, item.questionTa)}
              </summary>
              <p className="mt-3 text-muted">{pickLocale(locale, item.answerEn, item.answerTa)}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
