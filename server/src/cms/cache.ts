type Entry = {
  expires: number;
  body: unknown;
  version: number;
};

const cache = new Map<string, Entry>();
const ttlMs = 60_000;

export function readCache(key: string) {
  const hit = cache.get(key);
  if (!hit || hit.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit;
}

export function writeCache(key: string, body: unknown, version: number) {
  cache.set(key, { expires: Date.now() + ttlMs, body, version });
}

export function clearPublicCache() {
  cache.clear();
}
