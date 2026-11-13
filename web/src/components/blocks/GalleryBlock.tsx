import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAlbums, getPhotoCategories } from "../../lib/api";
import { localizedField, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import type { Album, Category } from "../../lib/types";
import { EmptyState } from "../public/EmptyState";

export function GalleryBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const heading = localizedField(content, locale, "heading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    Promise.all([getPhotoCategories(), getAlbums()])
      .then(([categoryResult, albumResult]) => {
        if (!active) return;
        setCategories(categoryResult.categories);
        setAlbums(albumResult.albums);
      })
      .catch(() => {
        if (!active) return;
        setCategories([]);
        setAlbums([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = filter === "all" ? albums : albums.filter((album) => album.categorySlug === filter);
  const featured = albums.filter((album) => album.isFeatured).slice(0, 8);

  return (
    <div>
      {heading ? <h2 className="mb-6 text-3xl text-ink">{heading}</h2> : null}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            active={filter === category.slug}
            onClick={() => setFilter(category.slug)}
            label={pickLocale(locale, category.nameEn, category.nameTa)}
          />
        ))}
      </div>

      {featured.length > 0 && filter === "all" ? (
        <div className="mb-8">
          <h3 className="mb-3 text-sm uppercase tracking-[0.16em] text-gold">Recent highlights</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {featured.map((album) => (
              <Link
                key={`feature-${album.id}`}
                to={`/photography/${album.slug}`}
                className="min-w-[10rem] rounded-2xl border border-gold/25 px-4 py-6 text-sm text-ink no-underline"
              >
                {pickLocale(locale, album.titleEn, album.titleTa)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState message="Photographs will appear here after they are published." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((album) => (
            <Link key={album.id} to={`/photography/${album.slug}`} className="card no-underline transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.14em] text-gold">
                {pickLocale(locale, album.categoryNameEn, album.categoryNameTa)}
              </p>
              <h3 className="mt-3 text-2xl text-ink">{pickLocale(locale, album.titleEn, album.titleTa)}</h3>
              {album.descriptionEn || album.descriptionTa ? (
                <p className="mt-2 text-sm text-muted">
                  {pickLocale(locale, album.descriptionEn, album.descriptionTa)}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm ${
        active ? "border-gold bg-gold text-black" : "border-gold/30 text-muted"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
