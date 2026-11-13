import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Fields";
import {
  ApiError,
  createAdminPage,
  deleteAdminPage,
  duplicateAdminPage,
  getAdminPages,
  publishAdminPage,
  unpublishAdminPage,
} from "../../lib/api";
import type { AdminPageSummary } from "../../lib/types";

export function PagesListPage() {
  const { token } = useAdmin();
  const navigate = useNavigate();
  const [pages, setPages] = useState<AdminPageSummary[]>([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminPages(token);
    setPages(data.pages);
  }

  useEffect(() => {
    let active = true;
    getAdminPages(token)
      .then((data) => {
        if (active) setPages(data.pages);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load pages");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function run(action: () => Promise<unknown>, ok: string) {
    setError("");
    setMessage("");
    try {
      await action();
      await refresh();
      setMessage(ok);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Action failed");
    }
  }

  return (
    <div className="grid max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Pages</h1>
        <p className="mt-2 text-muted">Create, duplicate, publish, or soft-delete CMS pages.</p>
      </div>
      <form
        className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/50 p-4 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const page = await createAdminPage(token, { slug, titleEn: title || slug });
            navigate(`/admin/pages/${page.id}`);
          }, "Page created");
        }}
      >
        <Field id="new-slug" label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
        <Field id="new-title" label="Title (EN)" value={title} onChange={(event) => setTitle(event.target.value)} />
        <div className="flex items-end">
          <Button type="submit">Create page</Button>
        </div>
      </form>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3">
        {pages.map((page) => (
          <article key={page.id} className="grid gap-3 rounded-[1.25rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-[1fr_auto]">
            <div>
              <Link className="font-heading text-2xl text-gold no-underline" to={`/admin/pages/${page.id}`}>
                {page.seo.en.title || page.slug}
              </Link>
              <p className="mt-1 text-sm text-muted">
                /{page.slug}
                {page.hasPublished ? ` · published v${page.publishedVersion}` : " · unpublished"}
                {page.hasDraft ? ` · draft v${page.draftVersion}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" href={`/admin/pages/${page.id}`}>
                Edit
              </Button>
              {page.hasPublished ? (
                <Button
                  variant="outline"
                  onClick={() => void run(() => unpublishAdminPage(token, page.id), "Unpublished")}
                >
                  Unpublish
                </Button>
              ) : (
                <Button onClick={() => void run(() => publishAdminPage(token, page.id), "Published")}>Publish</Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  void run(async () => {
                    const copy = await duplicateAdminPage(token, page.id);
                    navigate(`/admin/pages/${copy.id}`);
                  }, "Duplicated")
                }
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm(`Soft-delete /${page.slug}?`)) {
                    void run(() => deleteAdminPage(token, page.id), "Deleted");
                  }
                }}
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
