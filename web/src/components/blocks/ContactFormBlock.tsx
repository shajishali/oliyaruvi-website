import { asBoolean, localizedField, pickLocale, asString } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { formatPhone, telHref, whatsAppHref } from "../../lib/phone";
import { useSiteSettings } from "../public/PublicLayout";
import { Button } from "../ui/Button";
import { StudioForm } from "../public/StudioForm";

export function ContactFormBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const heading = localizedField(content, locale, "heading");
  const intro = localizedField(content, locale, "intro");
  const purpose = asString(content.purpose, "contact") === "booking" ? "booking" : "contact";
  const showPhone = asBoolean(content.showPhone, true);
  const showWhatsapp = asBoolean(content.showWhatsapp, true);
  const showMap = asBoolean(content.showMap, true);
  const showHours = asBoolean(content.showHours, true);
  const location = pickLocale(locale, settings.locationEn, settings.locationTa);
  const address = pickLocale(locale, settings.addressEn || "", settings.addressTa || "");

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card">
        {heading ? <h2 className="mb-2 text-3xl text-ink">{heading}</h2> : null}
        {intro ? <p className="mb-6 text-muted">{intro}</p> : null}
        <StudioForm purpose={purpose} />
      </div>
      <aside className="grid gap-4 self-start">
        {showWhatsapp ? (
          <Button variant="whatsapp" href={whatsAppHref(settings.whatsappNumber)}>
            Chat on WhatsApp
          </Button>
        ) : null}
        {showPhone ? (
          <div className="card text-sm">
            <p>
              <a href={telHref(settings.phonePrimary)}>{formatPhone(settings.phonePrimary)}</a>
            </p>
            <p className="mt-2">
              <a href={telHref(settings.phoneSecondary)}>{formatPhone(settings.phoneSecondary)}</a>
            </p>
          </div>
        ) : null}
        <div className="card text-sm text-muted">
          <h3 className="text-gold">Location</h3>
          <p className="mt-2">{address || settings.businessName}</p>
          <p className="mt-1">{location}</p>
          {settings.mapUrl ? (
            <a className="mt-3 inline-block text-light-gold" href={settings.mapUrl} target="_blank" rel="noreferrer">
              Get directions
            </a>
          ) : (
            <p className="mt-3">Map will appear here after the studio adds it.</p>
          )}
          {showMap && settings.mapUrl ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-gold/20">
              <iframe title="Studio map" src={settings.mapUrl} className="h-48 w-full" loading="lazy" />
            </div>
          ) : null}
        </div>
        {showHours ? (
          <div className="card text-sm text-muted">
            <h3 className="text-gold">Business hours</h3>
            <p className="mt-2">
              {settings.hours == null
                ? "Business hours will appear here after the studio adds them."
                : "Hours are saved in the studio settings."}
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
