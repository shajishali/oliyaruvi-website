import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Fields";
import { ApiError, deleteAdminMedia, getAdminMedia, updateAdminMedia, uploadAdminMedia } from "../../lib/api";
import type { AdminMedia } from "../../lib/types";

export function MediaPage() {
  const { token } = useAdmin();
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<AdminMedia | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function refresh() {
    const data = await getAdminMedia(token);
    setItems(data.media);
    if (selected) {
      setSelected(data.media.find((item) => item.id === selected.id) ?? null);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminMedia(token)
      .then((data) => {
        if (active) setItems(data.media);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load media");
      });
    return () => {
      active = false;
    };
  }, [token]);

  const folders = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item) => item.folder))).sort()],
    [items],
  );
  const visible = folder === "all" ? items : items.filter((item) => item.folder === folder);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const uploaded = await uploadAdminMedia(token, file, folder === "all" ? "library" : folder);
      setItems((current) => [uploaded, ...current]);
      setSelected(uploaded);
      setMessage("Uploaded.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  async function onSaveMeta() {
    if (!selected) return;
    setPending(true);
    setError("");
    try {
      const updated = await updateAdminMedia(token, selected.id, {
        altEn: selected.altEn,
        altTa: selected.altTa,
        title: selected.title,
        folder: selected.folder,
      });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      setMessage("Media details saved.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!selected) return;
    if (!confirm("Soft-delete this file?")) return;
    setPending(true);
    setError("");
    try {
      await deleteAdminMedia(token, selected.id);
      setSelected(null);
      await refresh();
      setMessage("Deleted.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Delete failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid max-w-6xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">Media library</h1>
          <p className="mt-2 text-muted">Upload images and video. Referenced files cannot be deleted.</p>
        </div>
        <label className="field max-w-xs">
          <span>Upload</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            disabled={pending}
            onChange={(event) => void onUpload(event.target.files?.[0])}
          />
        </label>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        {folders.map((name) => (
          <button
            key={name}
            type="button"
            className={`btn is-outline ${folder === name ? "ring-1 ring-gold" : ""}`}
            onClick={() => setFolder(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`overflow-hidden rounded-2xl border text-left ${
                selected?.id === item.id ? "border-gold" : "border-gold/20"
              }`}
              onClick={() => setSelected(item)}
            >
              {item.kind === "image" ? (
                <img src={item.url} alt={item.altEn || item.title} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-surface text-sm text-muted">
                  {item.mimeType}
                </div>
              )}
              <span className="block truncate px-2 py-2 text-xs text-muted">{item.title}</span>
            </button>
          ))}
        </div>
        {selected ? (
          <aside className="grid h-fit gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
            <h2 className="font-heading text-2xl text-gold">{selected.title}</h2>
            <p className="text-sm text-muted">
              {selected.mimeType} · {(selected.byteSize / 1024).toFixed(1)} KB · {selected.folder}
            </p>
            <Field
              id="media-title"
              label="Title"
              value={selected.title}
              onChange={(event) => setSelected({ ...selected, title: event.target.value })}
            />
            <Field
              id="media-folder"
              label="Folder"
              value={selected.folder}
              onChange={(event) => setSelected({ ...selected, folder: event.target.value })}
            />
            <Field
              id="media-alt-en"
              label="Alt EN"
              value={selected.altEn}
              onChange={(event) => setSelected({ ...selected, altEn: event.target.value })}
            />
            <Field
              id="media-alt-ta"
              label="Alt TA"
              value={selected.altTa}
              onChange={(event) => setSelected({ ...selected, altTa: event.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending} onClick={() => void onSaveMeta()}>
                Save details
              </Button>
              <Button variant="outline" disabled={pending} onClick={() => void onDelete()}>
                Soft delete
              </Button>
            </div>
          </aside>
        ) : (
          <p className="text-muted">Select a file to edit alt text and folder.</p>
        )}
      </div>
    </div>
  );
}
