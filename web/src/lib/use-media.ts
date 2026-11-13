import { useEffect, useState } from "react";
import { getJson } from "./api";

export type ResolvedMedia = {
  id: string;
  url: string;
  altEn: string;
  altTa: string;
  kind: "image" | "video" | "file";
  mimeType: string;
};

const cache = new Map<string, ResolvedMedia | null>();

export function useResolvedMedia(ids: string[]) {
  const key = ids.filter(Boolean).join(",");
  const [items, setItems] = useState<ResolvedMedia[]>(() =>
    ids
      .map((id) => cache.get(id))
      .filter((item): item is ResolvedMedia => Boolean(item)),
  );

  useEffect(() => {
    let alive = true;
    const missing = ids.filter((id) => id && !cache.has(id));
    if (missing.length === 0) {
      setItems(ids.map((id) => cache.get(id)).filter((item): item is ResolvedMedia => Boolean(item)));
      return;
    }
    getJson<{ media: ResolvedMedia[] }>(`/api/public/media?ids=${encodeURIComponent(missing.join(","))}`)
      .then((result) => {
        for (const id of missing) {
          const found = result.media.find((item) => item.id === id) ?? null;
          cache.set(id, found);
        }
        if (!alive) return;
        setItems(ids.map((id) => cache.get(id)).filter((item): item is ResolvedMedia => Boolean(item)));
      })
      .catch(() => {
        if (!alive) return;
        for (const id of missing) cache.set(id, null);
        setItems([]);
      });
    return () => {
      alive = false;
    };
  }, [key]);

  return items;
}
