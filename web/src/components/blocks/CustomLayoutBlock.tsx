import { asArray, asNumber, asRecord, pickLocale, asString } from "../../lib/content";
import { useLocale } from "../../lib/locale";

export function CustomLayoutBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const columns = Math.min(3, Math.max(1, asNumber(content.columns, 1)));
  const items = asArray(content.columnContent);

  return (
    <div className={`grid gap-6 ${columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : ""}`}>
      {items.map((raw, index) => {
        const item = asRecord(raw);
        const en = asRecord(item.en);
        const ta = asRecord(item.ta);
        const heading = pickLocale(locale, asString(en.heading), asString(ta.heading));
        const body = pickLocale(locale, asString(en.body), asString(ta.body));
        return (
          <div key={`${heading}-${index}`} className="card">
            {heading ? <h3 className="text-2xl text-ink">{heading}</h3> : null}
            {body ? <p className="mt-3 whitespace-pre-line text-muted">{body}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
