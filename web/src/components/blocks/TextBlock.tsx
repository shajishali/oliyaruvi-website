import { localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";

export function TextBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const body = localizedField(content, locale, "body");
  return (
    <div className="max-w-3xl">
      {heading ? <h2 className="text-3xl text-ink">{heading}</h2> : null}
      {body ? <p className="mt-4 whitespace-pre-line text-lg text-muted">{body}</p> : null}
    </div>
  );
}
