import { asString, localizedField } from "../../lib/content";
import { useLocale } from "../../lib/locale";

export function VideoHeroBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const subheading = localizedField(content, locale, "subheading");
  const youtubeUrl = asString(content.youtubeUrl);
  const mute = content.mute !== false;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-gold/20 bg-surface">
      <div className="px-6 py-10 md:px-10">
        {heading ? <h2 className="text-4xl text-ink">{heading}</h2> : null}
        {subheading ? <p className="mt-3 text-muted">{subheading}</p> : null}
      </div>
      {youtubeUrl ? (
        <div className="aspect-video">
          <iframe
            title={heading || "Video"}
            src={`${youtubeEmbed(youtubeUrl)}${mute ? "&mute=1" : ""}`}
            className="h-full w-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="px-6 pb-10 text-muted">Video will appear here after a source is added.</p>
      )}
    </div>
  );
}

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get("v") || parsed.pathname.split("/").pop();
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : url;
  } catch {
    return url;
  }
}
