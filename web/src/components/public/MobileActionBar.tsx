import { Button } from "../ui/Button";
import { telHref, whatsAppHref } from "../../lib/phone";
import type { SiteSettings } from "../../lib/types";

export function MobileActionBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-gold/30 bg-background/95 p-3 md:hidden">
      <Button className="flex-1" variant="whatsapp" href={whatsAppHref(settings.whatsappNumber)}>
        WhatsApp
      </Button>
      <Button className="flex-1" variant="outline" href={telHref(settings.phonePrimary)}>
        Call
      </Button>
    </div>
  );
}
