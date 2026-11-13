import { useEffect, useState } from "react";
import { getAdminMedia, uploadAdminMedia } from "../../lib/api";
import type { AdminMedia } from "../../lib/types";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { useAdmin } from "./useAdmin";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (media: AdminMedia) => void;
};

export function MediaPicker({ open, onClose, onPick }: Props) {
  const { token } = useAdmin();
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getAdminMedia(token)
      .then((data) => {
        if (active) setItems(data.media);
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      });
    return () => {
      active = false;
    };
  }, [open, token]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const uploaded = await uploadAdminMedia(token, file);
      setItems((current) => [uploaded, ...current]);
      onPick(uploaded);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Choose media">
      <div className="grid gap-4">
        <label className="field">
          <span>Upload</span>
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            disabled={pending}
            onChange={(event) => void onUpload(event.target.files?.[0])}
          />
        </label>
        {error ? (
          <p className="text-sm text-light-gold" role="alert">
            {error}
          </p>
        ) : null}
        <div className="grid max-h-80 grid-cols-2 gap-3 overflow-auto md:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="overflow-hidden rounded-2xl border border-gold/20 bg-background text-left"
              onClick={() => {
                onPick(item);
                onClose();
              }}
            >
              {item.kind === "image" ? (
                <img src={item.url} alt={item.altEn || item.title} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-surface text-sm text-muted">
                  {item.kind}
                </div>
              )}
              <span className="block truncate px-2 py-1 text-xs text-muted">{item.title}</span>
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
