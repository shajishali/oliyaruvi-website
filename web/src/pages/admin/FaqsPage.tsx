import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, TextAreaField } from "../../components/ui/Fields";
import { ApiError, deleteAdminFaq, getAdminFaqs, saveAdminFaq } from "../../lib/api";
import type { Faq } from "../../lib/types";

type Draft = Faq & { isVisible?: boolean };

const blank: Draft = {
  id: "",
  questionEn: "",
  questionTa: "",
  answerEn: "",
  answerTa: "",
  sortOrder: 0,
  isVisible: true,
};

export function FaqsPage() {
  const { token } = useAdmin();
  const [items, setItems] = useState<Draft[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminFaqs(token);
    setItems(data.faqs as Draft[]);
  }

  useEffect(() => {
    let active = true;
    getAdminFaqs(token)
      .then((data) => {
        if (active) setItems(data.faqs as Draft[]);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load FAQs");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setError("");
    setMessage("");
    try {
      await saveAdminFaq(
        token,
        {
          questionEn: draft.questionEn,
          questionTa: draft.questionTa,
          answerEn: draft.answerEn,
          answerTa: draft.answerTa,
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
        <h1 className="font-heading text-4xl">FAQs</h1>
        <p className="mt-2 text-muted">Shared questions used by FAQ blocks.</p>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
        <Field id="q-en" label="Question EN" value={draft.questionEn} onChange={(e) => setDraft({ ...draft, questionEn: e.target.value })} />
        <Field id="q-ta" label="Question TA" value={draft.questionTa} onChange={(e) => setDraft({ ...draft, questionTa: e.target.value })} />
        <TextAreaField id="a-en" label="Answer EN" rows={3} value={draft.answerEn} onChange={(e) => setDraft({ ...draft, answerEn: e.target.value })} />
        <TextAreaField id="a-ta" label="Answer TA" rows={3} value={draft.answerTa} onChange={(e) => setDraft({ ...draft, answerTa: e.target.value })} />
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
            <h2 className="text-xl text-gold">{item.questionEn}</h2>
            <p className="mt-2 text-muted">{item.answerEn}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDraft(item)}>
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await deleteAdminFaq(token, item.id);
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
