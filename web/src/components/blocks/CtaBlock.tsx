import { localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { Button } from "../ui/Button";

export function CtaBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const body = localizedField(content, locale, "body");
  const buttonLabel = localizedField(content, locale, "buttonLabel");
  const href = String(content.href || "");

  return (
    <div className="card flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {heading ? <h2 className="text-3xl text-ink">{heading}</h2> : null}
        {body ? <p className="mt-2 text-muted">{body}</p> : null}
      </div>
      {buttonLabel && href ? <Button href={href}>{buttonLabel}</Button> : null}
    </div>
  );
}
