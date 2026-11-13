import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import { ApiError, deleteAdminAlbum, getAdminAlbums, getPhotoCategories, saveAdminAlbum } from "../../lib/api";

type Album = {
  id: string;
  slug: string;
  categoryId: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  coverMediaId: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  photographs: { id?: string; mediaId: string; captionEn: string; captionTa: string; sortOrder: number; isVisible: boolean }[];
};

const blank: Omit<Album, "id"> = {
  slug: "",
  categoryId: "",
  titleEn: "",
  titleTa: "",
  descriptionEn: "",
  descriptionTa: "",
  coverMediaId: null,
  sortOrder: 0,
  isFeatured: false,
  isVisible: true,
  photographs: [],
};

export function PhotographyAdminPage() {
  const { token } = useAdmin();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<{ id: string; nameEn: string }[]>([]);
  const [draft, setDraft] = useState<Album | (Omit<Album, "id"> & { id?: string })>({ ...blank });
  const [mediaIds, setMediaIds] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminAlbums(token);
    setAlbums(data.albums as Album[]);
  }

  useEffect(() => {
    let active = true;
    Promise.all([getAdminAlbums(token), getPhotoCategories()])
      .then(([albumData, categoryData]) => {
        if (!active) return;
        setAlbums(albumData.albums as Album[]);
        setCategories(categoryData.categories);
        setDraft((current) => ({
          ...current,
          categoryId: current.categoryId || categoryData.categories[0]?.id || "",
        }));
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load albums");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setError("");
    setMessage("");
    try {
      const photographs = mediaIds
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((mediaId, sortOrder) => ({
          mediaId,
          captionEn: "",
          captionTa: "",
          sortOrder,
          isVisible: true,
        }));
      await saveAdminAlbum(
        token,
        {
          ...draft,
          photographs: photographs.length ? photographs : draft.photographs,
          coverMediaId: draft.coverMediaId || photographs[0]?.mediaId || null,
        },
        draft.id,
      );
      setDraft({ ...blank, categoryId: categories[0]?.id || "" });
      setMediaIds("");
      await refresh();
      setMessage("Album saved. Visible albums appear on /photography.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    }
  }

  return (
    <div className="grid max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Photography</h1>
        <p className="mt-2 text-muted">Albums, covers, featured flags, and media from the library.</p>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
        <Field id="album-title" label="Title EN" value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} />
        <Field id="album-slug" label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        <SelectField id="album-cat" label="Category" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </SelectField>
        <Field id="album-cover" label="Cover media ID" value={draft.coverMediaId || ""} onChange={(e) => setDraft({ ...draft, coverMediaId: e.target.value || null })} />
        <TextAreaField id="album-desc" label="Description EN" rows={3} value={draft.descriptionEn} onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })} />
        <TextAreaField id="album-media" label="Photo media IDs (comma or space separated)" rows={3} value={mediaIds} onChange={(e) => setMediaIds(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isVisible} onChange={(e) => setDraft({ ...draft, isVisible: e.target.checked })} />
          Visible / published
        </label>
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={() => void onSave()}>{draft.id ? "Update album" : "Create album"}</Button>
          {draft.id ? (
            <Button variant="outline" onClick={() => setDraft({ ...blank, categoryId: categories[0]?.id || "" })}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3">
        {albums.map((album) => (
          <article key={album.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h2 className="text-xl text-gold">{album.titleEn}</h2>
            <p className="text-sm text-muted">
              /{album.slug} · {album.photographs.length} photos · {album.isVisible ? "visible" : "hidden"}
              {album.isFeatured ? " · featured" : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDraft(album);
                  setMediaIds(album.photographs.map((photo) => photo.mediaId).join(", "));
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await deleteAdminAlbum(token, album.id);
                    await refresh();
                  })()
                }
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
