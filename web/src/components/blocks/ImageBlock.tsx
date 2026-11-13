import { asString, localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { useResolvedMedia } from "../../lib/use-media";
import { AppLink } from "../ui/AppLink";
import { MediaImage } from "../public/MediaImage";

export function ImageBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const caption = localizedField(content, locale, "caption");
  const href = asString(content.href);
  const mediaId = asString(content.mediaId);
  const media = useResolvedMedia(mediaId ? [mediaId] : []);
  const item = media[0];
  const alt = locale === "ta" && item?.altTa ? item.altTa : item?.altEn || caption || "";

  const body = (
    <figure>
      {item?.url ? (
        <MediaImage src={item.url} alt={alt} className="w-full rounded-[1.5rem] border border-gold/20 object-cover" />
      ) : (
        <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-gold/25 text-sm text-muted">
          Image will appear here after it is published.
        </div>
      )}
      {caption ? <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
  return href ? <AppLink href={href}>{body}</AppLink> : body;
}
