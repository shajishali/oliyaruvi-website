import type { Locale } from "./locale";

export function pickLocale(locale: Locale, en: string | undefined, ta: string | undefined) {
  if (locale === "ta" && ta?.trim()) return ta;
  return en?.trim() ? en : ta?.trim() ? ta : "";
}

export function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function localizedField(
  content: Record<string, unknown>,
  locale: Locale,
  field: string,
) {
  const en = asRecord(content.en);
  const ta = asRecord(content.ta);
  return pickLocale(locale, asString(en[field]), asString(ta[field]));
}
