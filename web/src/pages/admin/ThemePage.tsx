import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField } from "../../components/ui/Fields";
import { ApiError, getAdminTheme, publishAdminTheme, saveAdminThemeDraft } from "../../lib/api";
import type { ThemeTokens } from "../../lib/types";

type ThemePayload = {
  tokens: ThemeTokens;
  headerVariant: string;
  footerVariant: string;
  buttonVariant: string;
};

const fallback: ThemePayload = {
  tokens: {
    color: {
      background: "#0B0B0D",
      surface: "#17171B",
      gold: "#D6AC57",
      lightGold: "#F3D58C",
      maroon: "#651C2A",
      text: "#F7F3EB",
      muted: "#B8B1A8",
    },
    font: { heading: "Playfair Display", body: "Inter", tamil: "Noto Sans Tamil" },
    radius: "999px",
    spacing: "4.5rem",
  },
  headerVariant: "studio",
  footerVariant: "studio",
  buttonVariant: "gold",
};

export function ThemePage() {
  const { token } = useAdmin();
  const [draft, setDraft] = useState<ThemePayload>(fallback);
  const [published, setPublished] = useState<ThemePayload | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminTheme(token)
      .then((data) => {
        if (!active) return;
        const nextDraft = (data.draft as ThemePayload | null) ?? (data.published as ThemePayload) ?? fallback;
        setDraft(structuredClone(nextDraft));
        setPublished((data.published as ThemePayload) ?? null);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load theme");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function saveDraft() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      await saveAdminThemeDraft(token, draft);
      setMessage("Theme draft saved. Public site still uses the published theme.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function publish() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      await saveAdminThemeDraft(token, draft);
      const result = await publishAdminTheme(token);
      setPublished((result as { published: ThemePayload }).published ?? draft);
      setMessage("Theme published.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Publish failed");
    } finally {
      setPending(false);
    }
  }

  function setColor(key: keyof ThemeTokens["color"], value: string) {
    setDraft((current) => ({
      ...current,
      tokens: { ...current.tokens, color: { ...current.tokens.color, [key]: value } },
    }));
  }

  return (
    <div className="grid max-w-4xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">Theme</h1>
          <p className="mt-2 text-muted">Edit tokens as a draft, then publish when ready.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending} onClick={() => void saveDraft()}>
            Save draft
          </Button>
          <Button disabled={pending} onClick={() => void publish()}>
            Publish theme
          </Button>
        </div>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <section className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
        {(Object.keys(draft.tokens.color) as (keyof ThemeTokens["color"])[]).map((key) => (
          <Field
            key={key}
            id={`color-${key}`}
            label={key}
            value={draft.tokens.color[key]}
            onChange={(event) => setColor(key, event.target.value)}
          />
        ))}
        <Field
          id="font-heading"
          label="Heading font"
          value={draft.tokens.font.heading}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              tokens: { ...current.tokens, font: { ...current.tokens.font, heading: event.target.value } },
            }))
          }
        />
        <Field
          id="font-body"
          label="Body font"
          value={draft.tokens.font.body}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              tokens: { ...current.tokens, font: { ...current.tokens.font, body: event.target.value } },
            }))
          }
        />
        <Field
          id="spacing"
          label="Section spacing"
          value={draft.tokens.spacing}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              tokens: { ...current.tokens, spacing: event.target.value },
            }))
          }
        />
        <Field
          id="radius"
          label="Radius"
          value={draft.tokens.radius}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              tokens: { ...current.tokens, radius: event.target.value },
            }))
          }
        />
        <SelectField
          id="header-variant"
          label="Header style"
          value={draft.headerVariant}
          onChange={(event) => setDraft((current) => ({ ...current, headerVariant: event.target.value }))}
        >
          <option value="studio">Studio</option>
          <option value="compact">Compact</option>
        </SelectField>
        <SelectField
          id="footer-variant"
          label="Footer style"
          value={draft.footerVariant}
          onChange={(event) => setDraft((current) => ({ ...current, footerVariant: event.target.value }))}
        >
          <option value="studio">Studio</option>
          <option value="compact">Compact</option>
        </SelectField>
        <SelectField
          id="button-variant"
          label="Button style"
          value={draft.buttonVariant}
          onChange={(event) => setDraft((current) => ({ ...current, buttonVariant: event.target.value }))}
        >
          <option value="gold">Gold</option>
          <option value="outline">Outline</option>
        </SelectField>
      </section>
      {published ? (
        <p className="text-sm text-muted">
          Published gold token: {published.tokens.color.gold}. Draft changes stay private until publish.
        </p>
      ) : null}
    </div>
  );
}
