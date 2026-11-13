import { asArray, asRecord, asString, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { useSiteSettings } from "../public/PublicLayout";

export function StatisticsBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const items = asArray(content.items);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((raw, index) => {
        const item = asRecord(raw);
        const en = asRecord(item.en);
        const ta = asRecord(item.ta);
        const label = pickLocale(locale, asString(en.label), asString(ta.label));
        const value =
          item.valueSource === "setting" && item.settingKey === "experience_years"
            ? settings.experienceYears
            : item.literalValue ?? "";
        return (
          <div key={`${label}-${index}`} className="card text-center">
            <p className="font-heading text-4xl text-gold">{String(value)}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-muted">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
