import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import { ApiError, deleteAdminVideo, getAdminVideos, saveAdminVideo } from "../../lib/api";

type Video = {
  id: string;
  collectionId: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  sourceType: "youtube" | "upload";
  youtubeUrl: string | null;
  mediaId: string | null;
  thumbnailMediaId: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
};

type Collection = { id: string; titleEn: string; slug: string };

const blank: Omit<Video, "id"> = {
  collectionId: "",
  titleEn: "",
  titleTa: "",
  descriptionEn: "",
  descriptionTa: "",
  sourceType: "youtube",
  youtubeUrl: "",
  mediaId: null,
  thumbnailMediaId: null,
  sortOrder: 0,
  isFeatured: false,
  isVisible: true,
};

export function VideographyAdminPage() {
  const { token } = useAdmin();
  const [videos, setVideos] = useState<Video[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [draft, setDraft] = useState<Video | (Omit<Video, "id"> & { id?: string })>({ ...blank });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminVideos(token);
    setVideos(data.videos as Video[]);
    setCollections(data.collections as Collection[]);
  }

  useEffect(() => {
    let active = true;
    getAdminVideos(token)
      .then((data) => {
        if (!active) return;
        setVideos(data.videos as Video[]);
        setCollections(data.collections as Collection[]);
        setDraft((current) => ({
          ...current,
          collectionId: current.collectionId || (data.collections[0] as Collection | undefined)?.id || "",
        }));
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load videos");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setError("");
    setMessage("");
    try {
      await saveAdminVideo(token, draft, draft.id);
      setDraft({ ...blank, collectionId: collections[0]?.id || "" });
      await refresh();
      setMessage("Video saved.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    }
  }

  return (
    <div className="grid max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Videography</h1>
        <p className="mt-2 text-muted">Collections, YouTube or uploaded sources, and featured films.</p>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
        <Field id="v-title" label="Title EN" value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} />
        <SelectField id="v-collection" label="Collection" value={draft.collectionId} onChange={(e) => setDraft({ ...draft, collectionId: e.target.value })}>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.titleEn}
            </option>
          ))}
        </SelectField>
        <SelectField id="v-source" label="Source" value={draft.sourceType} onChange={(e) => setDraft({ ...draft, sourceType: e.target.value as "youtube" | "upload" })}>
          <option value="youtube">YouTube</option>
          <option value="upload">Upload</option>
        </SelectField>
        <Field id="v-yt" label="YouTube URL" value={draft.youtubeUrl || ""} onChange={(e) => setDraft({ ...draft, youtubeUrl: e.target.value })} />
        <Field id="v-media" label="Upload media ID" value={draft.mediaId || ""} onChange={(e) => setDraft({ ...draft, mediaId: e.target.value || null })} />
        <Field id="v-thumb" label="Thumbnail media ID" value={draft.thumbnailMediaId || ""} onChange={(e) => setDraft({ ...draft, thumbnailMediaId: e.target.value || null })} />
        <TextAreaField id="v-desc" label="Description EN" rows={3} value={draft.descriptionEn} onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isVisible} onChange={(e) => setDraft({ ...draft, isVisible: e.target.checked })} />
          Visible
        </label>
        <div className="md:col-span-2">
          <Button onClick={() => void onSave()}>{draft.id ? "Update video" : "Add video"}</Button>
        </div>
      </div>
      <div className="grid gap-3">
        {videos.map((video) => (
          <article key={video.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h2 className="text-xl text-gold">{video.titleEn}</h2>
            <p className="text-sm text-muted">{video.sourceType} · {video.isVisible ? "visible" : "hidden"}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => setDraft(video)}>
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await deleteAdminVideo(token, video.id);
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
