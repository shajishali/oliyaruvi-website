import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import {
  ApiError,
  deleteAdminLiveEvent,
  getAdminLiveChannels,
  getAdminLiveEvents,
  saveAdminLiveChannel,
  saveAdminLiveEvent,
} from "../../lib/api";

type Channel = {
  id: string;
  key: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  externalUrl: string | null;
  isVisible: boolean;
  sortOrder: number;
};

type Event = {
  id: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  thumbnailMediaId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: "draft" | "upcoming" | "live" | "ended";
  isFeatured: boolean;
  isPublished: boolean;
  replayUrl: string | null;
  channelId: string | null;
  links: { id?: string; platform: string; url: string; labelEn: string; labelTa: string; sortOrder: number }[];
};

const blankEvent: Omit<Event, "id"> = {
  titleEn: "",
  titleTa: "",
  descriptionEn: "",
  descriptionTa: "",
  thumbnailMediaId: null,
  startsAt: "",
  endsAt: "",
  status: "upcoming",
  isFeatured: false,
  isPublished: false,
  replayUrl: "",
  channelId: null,
  links: [],
};

export function LiveAdminPage() {
  const { token } = useAdmin();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<Event | (Omit<Event, "id"> & { id?: string })>({ ...blankEvent });
  const [fbUrl, setFbUrl] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh(status = filter) {
    const [channelData, eventData] = await Promise.all([
      getAdminLiveChannels(token),
      getAdminLiveEvents(token, status),
    ]);
    setChannels(channelData.channels as Channel[]);
    setEvents(eventData.events as Event[]);
  }

  useEffect(() => {
    let active = true;
    refresh()
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load live manager");
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onSaveEvent() {
    setError("");
    setMessage("");
    try {
      const links = [
        fbUrl.trim() ? { platform: "facebook", url: fbUrl.trim(), labelEn: "Facebook", labelTa: "", sortOrder: 0 } : null,
        ytUrl.trim() ? { platform: "youtube", url: ytUrl.trim(), labelEn: "YouTube", labelTa: "", sortOrder: 1 } : null,
      ].filter(Boolean);
      await saveAdminLiveEvent(
        token,
        {
          ...draft,
          startsAt: draft.startsAt || null,
          endsAt: draft.endsAt || null,
          replayUrl: draft.replayUrl || null,
          links,
        },
        draft.id,
      );
      setDraft({ ...blankEvent, channelId: channels[0]?.id || null });
      setFbUrl("");
      setYtUrl("");
      await refresh();
      setMessage("Event saved. Only published non-draft events appear publicly.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    }
  }

  return (
    <div className="grid max-w-5xl gap-8">
      <div>
        <h1 className="font-heading text-4xl">Live manager</h1>
        <p className="mt-2 text-muted">Channels and events. Publish is separate from Live status.</p>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}

      <section className="grid gap-3">
        <h2 className="font-heading text-2xl text-gold">Channels</h2>
        {channels.map((channel) => (
          <article key={channel.id} className="grid gap-3 rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4 md:grid-cols-2">
            <Field
              id={`ch-name-${channel.id}`}
              label="Display name"
              value={channel.nameEn}
              onChange={(e) =>
                setChannels((current) =>
                  current.map((item) => (item.id === channel.id ? { ...item, nameEn: e.target.value } : item)),
                )
              }
            />
            <Field
              id={`ch-url-${channel.id}`}
              label="External URL"
              value={channel.externalUrl || ""}
              onChange={(e) =>
                setChannels((current) =>
                  current.map((item) => (item.id === channel.id ? { ...item, externalUrl: e.target.value } : item)),
                )
              }
            />
            <TextAreaField
              id={`ch-desc-${channel.id}`}
              label="Description"
              rows={2}
              value={channel.descriptionEn}
              onChange={(e) =>
                setChannels((current) =>
                  current.map((item) => (item.id === channel.id ? { ...item, descriptionEn: e.target.value } : item)),
                )
              }
            />
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={channel.isVisible}
                  onChange={(e) =>
                    setChannels((current) =>
                      current.map((item) => (item.id === channel.id ? { ...item, isVisible: e.target.checked } : item)),
                    )
                  }
                />
                Visible
              </label>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await saveAdminLiveChannel(token, channel.id, channel);
                    setMessage(`Saved ${channel.nameEn}`);
                  })()
                }
              >
                Save channel
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl text-gold">Events</h2>
          <SelectField
            id="event-filter"
            label="Filter"
            value={filter}
            onChange={(e) => {
              const next = e.target.value;
              setFilter(next);
              void refresh(next);
            }}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
          </SelectField>
        </div>
        <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
          <Field id="ev-title" label="Title EN" value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} />
          <SelectField id="ev-status" label="Status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Event["status"] })}>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
          </SelectField>
          <Field id="ev-start" label="Starts at" type="datetime-local" value={draft.startsAt || ""} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
          <SelectField id="ev-channel" label="Channel" value={draft.channelId || ""} onChange={(e) => setDraft({ ...draft, channelId: e.target.value || null })}>
            <option value="">None</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.nameEn}
              </option>
            ))}
          </SelectField>
          <Field id="ev-fb" label="Facebook URL" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
          <Field id="ev-yt" label="YouTube URL" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
          <Field id="ev-replay" label="Replay URL" value={draft.replayUrl || ""} onChange={(e) => setDraft({ ...draft, replayUrl: e.target.value })} />
          <TextAreaField id="ev-desc" label="Description" rows={3} value={draft.descriptionEn} onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} />
            Published on public site
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} />
            Featured
          </label>
          <div className="md:col-span-2">
            <Button onClick={() => void onSaveEvent()}>{draft.id ? "Update event" : "Create event"}</Button>
          </div>
        </div>
        {events.map((event) => (
          <article key={event.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h3 className="text-xl text-gold">{event.titleEn}</h3>
            <p className="text-sm text-muted">
              {event.status} · {event.isPublished ? "published" : "unpublished"}
              {event.links.length ? ` · ${event.links.length} link(s)` : " · no watch URL"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDraft(event);
                  setFbUrl(event.links.find((link) => link.platform === "facebook")?.url || "");
                  setYtUrl(event.links.find((link) => link.platform === "youtube")?.url || "");
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await deleteAdminLiveEvent(token, event.id);
                    await refresh();
                  })()
                }
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
