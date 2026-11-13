import { AppLink } from "../ui/AppLink";
import { asArray, asRecord, asString, localizedField, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";

export function ServicesBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const items = asArray(content.items);

  return (
    <div>
      {heading ? <h2 className="mb-8 text-3xl text-ink">{heading}</h2> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((raw, index) => {
          const item = asRecord(raw);
          const en = asRecord(item.en);
          const ta = asRecord(item.ta);
          const title = pickLocale(locale, asString(en.title), asString(ta.title));
          const text = pickLocale(locale, asString(en.text), asString(ta.text));
          const href = asString(item.href, "#");
          return (
            <AppLink
              key={`${href}-${index}`}
              href={href}
              className="service-card card group no-underline transition duration-300 hover:-translate-y-1 hover:border-gold/50"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-gold">{asString(item.icon) || "Service"}</p>
              <h3 className="mt-4 text-xl text-ink group-hover:text-light-gold">{title}</h3>
              {text ? <p className="mt-2 text-sm text-muted">{text}</p> : null}
            </AppLink>
          );
        })}
      </div>
    </div>
  );
}
