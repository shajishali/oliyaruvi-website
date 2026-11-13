import { useEffect, useState } from "react";
import { getLiveChannels, getLiveEvents } from "../../lib/api";
import { asString, localizedField, pickLocale } from "../../lib/content";
import { liveEventBadgeLabel, matchesLiveMode } from "../../lib/live-badge";
import { useLocale } from "../../lib/locale";
import type { LiveChannel, LiveEvent } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../public/EmptyState";

export function LiveEventsBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const mode = asString(content.mode, "upcoming") as "featured" | "upcoming" | "past";
  const limit = typeof content.limit === "number" ? content.limit : 6;
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [channels, setChannels] = useState<LiveChannel[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([getLiveEvents(), getLiveChannels()])
      .then(([eventResult, channelResult]) => {
        if (!alive) return;
        setEvents(eventResult.events);
        setChannels(channelResult.channels);
      })
      .catch(() => {
        if (!alive) return;
        setEvents([]);
        setChannels([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const identities = channels.filter((channel) => channel.kind === "identity");
  const filtered = events
    .filter((event) => matchesLiveMode(event.status, mode, event.isFeatured))
    .slice(0, limit);

  return (
    <div>
      {heading ? <h2 className="mb-6 text-3xl text-ink">{heading}</h2> : null}

      {mode === "featured" || mode === "upcoming" ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {identities.map((channel) =>
            channel.externalUrl ? (
              <a
                key={channel.id}
                href={channel.externalUrl}
                className="rounded-full border border-gold/30 px-4 py-2 text-sm text-light-gold no-underline"
                target="_blank"
                rel="noreferrer"
              >
                {pickLocale(locale, channel.nameEn, channel.nameTa)}
              </a>
            ) : (
              <span key={channel.id} className="rounded-full border border-gold/20 px-4 py-2 text-sm text-muted">
                {pickLocale(locale, channel.nameEn, channel.nameTa)}
              </span>
            ),
          )}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState message="Live events will appear here after the studio publishes them." />
      ) : (
        <div className="grid gap-4">
          {filtered.map((event) => (
            <article key={event.id} className="card">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{liveEventBadgeLabel(event)}</Badge>
                {event.channelNameEn ? <span className="text-sm text-muted">{event.channelNameEn}</span> : null}
              </div>
              <h3 className="mt-3 text-2xl text-ink">{pickLocale(locale, event.titleEn, event.titleTa)}</h3>
              {event.startsAt ? (
                <p className="mt-2 text-sm text-muted">{new Date(event.startsAt).toLocaleString()}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {event.links
                  .filter((link) => link.platform === "facebook" || link.platform === "youtube")
                  .map((link) => (
                    <Button key={link.id} href={link.url} variant="outline">
                      {link.labelEn || (link.platform === "facebook" ? "Watch on Facebook" : "Watch on YouTube")}
                    </Button>
                  ))}
                {event.status === "ended" && event.replayUrl ? (
                  <Button href={event.replayUrl} variant="outline">
                    Watch replay
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
