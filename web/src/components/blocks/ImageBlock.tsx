import { asString, localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { AppLink } from "../ui/AppLink";

export function ImageBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const caption = localizedField(content, locale, "caption");
  const href = asString(content.href);
  const body = (
    <figure className="card">
      <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-gold/25 text-sm text-muted">
        Image will appear here after it is published.
      </div>
      {caption ? <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
  return href ? <AppLink href={href}>{body}</AppLink> : body;
}
