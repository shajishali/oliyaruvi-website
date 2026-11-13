import { useEffect, useState } from "react";
import { getVideoCategories, getVideos } from "../../lib/api";
import { localizedField, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import type { Category, VideoItem } from "../../lib/types";
import { Dialog } from "../ui/Dialog";
import { EmptyState } from "../public/EmptyState";

export function VideoGalleryBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<VideoItem | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getVideoCategories(), getVideos()])
      .then(([categoryResult, videoResult]) => {
        if (!alive) return;
        setCategories(categoryResult.categories);
        setVideos(videoResult.videos);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
        setVideos([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = filter === "all" ? videos : videos.filter((video) => video.categorySlug === filter);

  return (
    <div>
      {heading ? <h2 className="mb-6 text-3xl text-ink">{heading}</h2> : null}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full border px-4 py-2 text-sm ${filter === "all" ? "border-gold bg-gold text-black" : "border-gold/30 text-muted"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm ${
              filter === category.slug ? "border-gold bg-gold text-black" : "border-gold/30 text-muted"
            }`}
            onClick={() => setFilter(category.slug)}
          >
            {pickLocale(locale, category.nameEn, category.nameTa)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Films will appear here after they are published." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <button
              key={video.id}
              type="button"
              className="card text-left transition hover:-translate-y-1"
              onClick={() => setActive(video)}
            >
              <p className="text-xs uppercase tracking-[0.14em] text-gold">{video.categoryNameEn}</p>
              <h3 className="mt-3 text-xl text-ink">{pickLocale(locale, video.titleEn, video.titleTa)}</h3>
              {video.durationSeconds ? (
                <p className="mt-2 text-sm text-muted">{formatDuration(video.durationSeconds)}</p>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <Dialog open={Boolean(active)} title={active ? pickLocale(locale, active.titleEn, active.titleTa) : "Video"} onClose={() => setActive(null)}>
        {active?.sourceType === "youtube" && active.youtubeUrl ? (
          <div className="aspect-video overflow-hidden rounded-xl">
            <iframe
              title={pickLocale(locale, active.titleEn, active.titleTa)}
              src={youtubeEmbed(active.youtubeUrl)}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="text-muted">This video source is not ready to play yet.</p>
        )}
      </Dialog>
    </div>
  );
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
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
