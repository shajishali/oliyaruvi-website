import { useSiteSettings } from "../../components/public/PublicLayout";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { textFor, useLocale } from "../../lib/locale";
import { whatsAppHref } from "../../lib/phone";

const description = "Photography, videography, printing, and custom gifts in Nelliady.";

export function HomePage() {
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const heading = textFor(locale, settings.businessName, settings.businessNameTa);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-start justify-center px-4 py-section md:px-6">
      <Badge>{settings.experienceYears} years</Badge>
      <h1 lang={locale} className="mt-6 max-w-3xl text-5xl leading-tight text-ink md:text-6xl">
        {heading}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">{description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/photography">View portfolio</Button>
        <Button variant="whatsapp" href={whatsAppHref(settings.whatsappNumber)}>
          WhatsApp
        </Button>
      </div>
    </section>
  );
}
