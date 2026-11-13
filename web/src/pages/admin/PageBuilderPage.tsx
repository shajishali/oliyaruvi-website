import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createEmptySection } from "../../components/admin/default-section";
import { SectionEditor } from "../../components/admin/SectionEditor";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import { BLOCK_TYPES } from "../../lib/cms/blocks";
import { renderBlock } from "../../lib/cms/render-block";
import {
  ApiError,
  getAdminPage,
  publishAdminPage,
  restoreAdminPage,
  saveAdminDraft,
  unpublishAdminPage,
  updateAdminPageMeta,
} from "../../lib/api";
import type { AdminPageDetail, BlockType, PublicSection } from "../../lib/types";

export function PageBuilderPage() {
  const { pageId = "home" } = useParams();
  const { token } = useAdmin();
  const [page, setPage] = useState<AdminPageDetail | null>(null);
  const [sections, setSections] = useState<PublicSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [addType, setAddType] = useState<BlockType>("hero");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [seo, setSeo] = useState({
    en: { title: "", description: "" },
    ta: { title: "", description: "" },
  });

  useEffect(() => {
    let active = true;
    setError("");
    setMessage("");
    getAdminPage(token, pageId)
      .then((data) => {
        if (!active) return;
        setPage(data);
        const nextSections = structuredClone(data.draft?.sections ?? data.published?.sections ?? []);
        setSections(nextSections);
        setSelectedId(nextSections[0]?.id ?? null);
        setSeo(data.seo);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load page");
      });
    return () => {
      active = false;
    };
  }, [token, pageId]);

  const selected = useMemo(
    () => sections.find((section) => section.id === selectedId) ?? null,
    [sections, selectedId],
  );

  function reorder(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setSections(next.map((section, sortOrder) => ({ ...section, sortOrder })));
  }

  async function saveDraft() {
    if (!page) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await updateAdminPageMeta(token, page.id, { seo });
      const saved = await saveAdminDraft(
        token,
        page.id,
        sections.map((section, sortOrder) => ({ ...section, sortOrder })),
      );
      setPage(saved);
      setSections(structuredClone(saved.draft?.sections ?? []));
      setMessage("Draft saved. Public page unchanged.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function publish() {
    if (!page) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await updateAdminPageMeta(token, page.id, { seo });
      await saveAdminDraft(
        token,
        page.id,
        sections.map((section, sortOrder) => ({ ...section, sortOrder })),
      );
      const saved = await publishAdminPage(token, page.id);
      setPage(saved);
      setSections(structuredClone(saved.draft?.sections ?? saved.published?.sections ?? []));
      setMessage("Published. Refresh the public page to see it.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Publish failed");
    } finally {
      setPending(false);
    }
  }

  if (!page && !error) {
    return <p className="text-muted">Loading page builder…</p>;
  }
  if (!page) {
    return (
      <p className="text-light-gold" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            <Link to="/admin/pages" className="text-muted">
              Pages
            </Link>{" "}
            / {page.slug}
          </p>
          <h1 className="mt-2 font-heading text-4xl">{page.seo.en.title || page.slug}</h1>
          <p className="mt-2 text-muted">
            {page.hasPublished ? `Published v${page.publishedVersion}` : "Unpublished"}
            {page.hasDraft ? ` · draft v${page.draftVersion}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending} onClick={() => void saveDraft()}>
            Save draft
          </Button>
          <Button disabled={pending} onClick={() => void publish()}>
            Publish
          </Button>
          {page.hasPublished ? (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() =>
                void (async () => {
                  setPending(true);
                  try {
                    const saved = await unpublishAdminPage(token, page.id);
                    setPage(saved);
                    setMessage("Unpublished.");
                  } catch (caught) {
                    setError(caught instanceof ApiError ? caught.message : "Unpublish failed");
                  } finally {
                    setPending(false);
                  }
                })()
              }
            >
              Unpublish
            </Button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}

      <section className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
        <Field
          id="seo-title-en"
          label="SEO title EN"
          value={seo.en.title}
          onChange={(event) => setSeo({ ...seo, en: { ...seo.en, title: event.target.value } })}
        />
        <Field
          id="seo-title-ta"
          label="SEO title TA"
          value={seo.ta.title}
          onChange={(event) => setSeo({ ...seo, ta: { ...seo.ta, title: event.target.value } })}
        />
        <TextAreaField
          id="seo-desc-en"
          label="SEO description EN"
          rows={2}
          value={seo.en.description}
          onChange={(event) => setSeo({ ...seo, en: { ...seo.en, description: event.target.value } })}
        />
        <TextAreaField
          id="seo-desc-ta"
          label="SEO description TA"
          rows={2}
          value={seo.ta.description}
          onChange={(event) => setSeo({ ...seo, ta: { ...seo.ta, description: event.target.value } })}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <aside className="grid h-fit gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-3">
          <h2 className="font-heading text-xl text-gold">Sections</h2>
          <div className="grid gap-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`rounded-xl border px-3 py-2 ${
                  selectedId === section.id ? "border-gold bg-background/60" : "border-gold/15"
                }`}
              >
                <button type="button" className="w-full text-left" onClick={() => setSelectedId(section.id)}>
                  <span className="block text-sm text-ink">{section.blockType.replaceAll("_", " ")}</span>
                  <span className="block text-xs text-muted">{section.isVisible ? "Visible" : "Hidden"}</span>
                </button>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" className="btn is-outline px-2 py-1 text-xs" onClick={() => reorder(index, -1)}>
                    Up
                  </button>
                  <button type="button" className="btn is-outline px-2 py-1 text-xs" onClick={() => reorder(index, 1)}>
                    Down
                  </button>
                  <button
                    type="button"
                    className="btn is-outline px-2 py-1 text-xs"
                    onClick={() => {
                      const next = sections.filter((item) => item.id !== section.id);
                      setSections(next.map((item, sortOrder) => ({ ...item, sortOrder })));
                      if (selectedId === section.id) setSelectedId(next[0]?.id ?? null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 border-t border-gold/15 pt-3">
            <SelectField
              id="add-block"
              label="Add block"
              value={addType}
              onChange={(event) => setAddType(event.target.value as BlockType)}
            >
              {BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </SelectField>
            <Button
              variant="outline"
              onClick={() => {
                const section = createEmptySection(addType, sections.length);
                setSections([...sections, section]);
                setSelectedId(section.id);
              }}
            >
              Add section
            </Button>
          </div>
        </aside>

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn is-outline ${preview === "desktop" ? "ring-1 ring-gold" : ""}`}
              onClick={() => setPreview("desktop")}
            >
              Desktop preview
            </button>
            <button
              type="button"
              className={`btn is-outline ${preview === "mobile" ? "ring-1 ring-gold" : ""}`}
              onClick={() => setPreview("mobile")}
            >
              Mobile preview
            </button>
          </div>
          <div
            className={`mx-auto w-full overflow-hidden rounded-[1.5rem] border border-gold/20 bg-background p-4 ${
              preview === "mobile" ? "max-w-sm" : "max-w-5xl"
            }`}
          >
            <p className="mb-4 text-xs uppercase tracking-[0.14em] text-muted">Draft preview (not public)</p>
            <div className="grid gap-6">
              {sections
                .filter((section) => section.isVisible)
                .map((section) => (
                  <div key={section.id}>{renderBlock(section.blockType, section.content)}</div>
                ))}
              {sections.filter((section) => section.isVisible).length === 0 ? (
                <p className="text-muted">No visible sections in this draft.</p>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="grid h-fit gap-4 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
          <h2 className="font-heading text-xl text-gold">Editor</h2>
          {selected ? (
            <SectionEditor
              section={selected}
              onChange={(next) =>
                setSections((current) => current.map((section) => (section.id === next.id ? next : section)))
              }
            />
          ) : (
            <p className="text-muted">Select a section to edit.</p>
          )}
          <div className="border-t border-gold/15 pt-4">
            <h3 className="text-lg text-gold">Versions</h3>
            <ul className="mt-2 grid gap-2">
              {(page.history ?? []).length === 0 ? <li className="text-sm text-muted">No published revisions yet.</li> : null}
              {(page.history ?? [])
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.version} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-muted">
                      v{entry.version} · {new Date(entry.createdAt).toLocaleString()}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        void (async () => {
                          setPending(true);
                          setError("");
                          try {
                            const saved = await restoreAdminPage(token, page.id, entry.version);
                            setPage(saved);
                            setSections(structuredClone(saved.draft?.sections ?? []));
                            setSelectedId(saved.draft?.sections[0]?.id ?? null);
                            setMessage(`Restored v${entry.version} into a new draft. Live page unchanged.`);
                          } catch (caught) {
                            setError(caught instanceof ApiError ? caught.message : "Restore failed");
                          } finally {
                            setPending(false);
                          }
                        })()
                      }
                    >
                      Restore to draft
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
