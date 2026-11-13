import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAlbum } from "../../lib/api";
import { pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import type { Album, Photograph } from "../../lib/types";
import { EmptyState } from "../../components/public/EmptyState";
import { Lightbox } from "../../components/public/Lightbox";

export function AlbumPage() {
  const { slug = "" } = useParams();
  const { locale } = useLocale();
  const [album, setAlbum] = useState<(Album & { photographs: Photograph[] }) | null>(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    getAlbum(slug)
      .then((result) => {
        if (!alive) return;
        setAlbum(result.album);
        document.title = `${pickLocale(locale, result.album.titleEn, result.album.titleTa)} · Oliyaruvi`;
      })
      .catch(() => {
        if (!alive) return;
        setError("Album not found.");
      });
    return () => {
      alive = false;
    };
  }, [slug, locale]);

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
        <h1 className="text-4xl">Album not found</h1>
        <p className="mt-4 text-muted">{error}</p>
        <Link className="mt-6 inline-block text-gold" to="/photography">
          Back to photography
        </Link>
      </section>
    );
  }

  if (!album) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
        <p className="text-muted">Loading…</p>
      </section>
    );
  }

  const photos = album.photographs.filter((photo) => photo.url);
  const active = index != null ? photos[index] : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-section md:px-6">
      <Link className="text-sm text-gold no-underline" to="/photography">
        ← Photography
      </Link>
      <h1 className="mt-4 text-4xl text-ink">{pickLocale(locale, album.titleEn, album.titleTa)}</h1>
      <p className="mt-2 text-muted">{pickLocale(locale, album.categoryNameEn, album.categoryNameTa)}</p>
      {album.descriptionEn || album.descriptionTa ? (
        <p className="mt-4 max-w-2xl text-muted">
          {pickLocale(locale, album.descriptionEn, album.descriptionTa)}
        </p>
      ) : null}

      {photos.length === 0 ? (
        <div className="mt-8">
          <EmptyState message="Photographs will appear here after they are published." />
        </div>
      ) : (
        <div className="masonry mt-8">
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.id}
              type="button"
              className="masonry-item"
              onClick={() => setIndex(photoIndex)}
            >
              <img
                src={photo.url || ""}
                alt={pickLocale(locale, photo.altEn || photo.captionEn, photo.altTa || photo.captionTa)}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={Boolean(active)}
        src={active?.url || ""}
        alt={active ? pickLocale(locale, active.altEn || active.captionEn, active.altTa || active.captionTa) : ""}
        onClose={() => setIndex(null)}
        onPrev={() => setIndex((current) => (current == null ? current : (current - 1 + photos.length) % photos.length))}
        onNext={() => setIndex((current) => (current == null ? current : (current + 1) % photos.length))}
      />
    </section>
  );
}
