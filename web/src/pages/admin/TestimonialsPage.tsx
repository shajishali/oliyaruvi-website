import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, TextAreaField } from "../../components/ui/Fields";
import { ApiError, deleteAdminTestimonial, getAdminTestimonials, saveAdminTestimonial } from "../../lib/api";
import type { Testimonial } from "../../lib/types";

type Draft = Testimonial & { isVisible?: boolean };

const blank: Draft = {
  id: "",
  personName: "",
  locationLabel: "",
  quoteEn: "",
  quoteTa: "",
  isFeatured: false,
  sortOrder: 0,
  isVisible: true,
};

export function TestimonialsPage() {
  const { token } = useAdmin();
  const [items, setItems] = useState<Draft[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminTestimonials(token);
    setItems(data.testimonials as Draft[]);
  }

  useEffect(() => {
    let active = true;
    getAdminTestimonials(token)
      .then((data) => {
        if (active) setItems(data.testimonials as Draft[]);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load testimonials");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setError("");
    setMessage("");
    try {
      await saveAdminTestimonial(
        token,
        {
          personName: draft.personName,
          locationLabel: draft.locationLabel,
          quoteEn: draft.quoteEn,
          quoteTa: draft.quoteTa,
          isFeatured: draft.isFeatured,
          isVisible: draft.isVisible ?? true,
          sortOrder: draft.sortOrder,
        },
        draft.id || undefined,
      );
      setDraft(blank);
      await refresh();
      setMessage("Saved.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    }
  }

  return (
    <div className="grid max-w-4xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Testimonials</h1>
        <p className="mt-2 text-muted">Shared quotes used by testimonial blocks.</p>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
        <Field id="person" label="Name" value={draft.personName} onChange={(e) => setDraft({ ...draft, personName: e.target.value })} />
        <Field id="loc" label="Location label" value={draft.locationLabel} onChange={(e) => setDraft({ ...draft, locationLabel: e.target.value })} />
        <TextAreaField id="quote-en" label="Quote EN" rows={3} value={draft.quoteEn} onChange={(e) => setDraft({ ...draft, quoteEn: e.target.value })} />
        <TextAreaField id="quote-ta" label="Quote TA" rows={3} value={draft.quoteTa} onChange={(e) => setDraft({ ...draft, quoteTa: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={draft.isVisible ?? true}
            onChange={(e) => setDraft({ ...draft, isVisible: e.target.checked })}
          />
          Visible
        </label>
        <div className="flex gap-2">
          <Button onClick={() => void onSave()}>{draft.id ? "Update" : "Add"}</Button>
          {draft.id ? (
            <Button variant="outline" onClick={() => setDraft(blank)}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h2 className="text-xl text-gold">{item.personName}</h2>
            <p className="mt-2 text-muted">{item.quoteEn}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDraft(item)}>
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await deleteAdminTestimonial(token, item.id);
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
