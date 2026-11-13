import { useEffect, useState } from "react";
import { getPage } from "../../lib/api";
import { asString, pickLocale } from "../../lib/content";
import { renderBlock } from "../../lib/cms/render-block";
import { useLocale } from "../../lib/locale";
import type { PageResponse, PublicSection } from "../../lib/types";
import { Reveal } from "../../components/public/Reveal";

export function CmsPage({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const [page, setPage] = useState<PageResponse["page"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setError("");
    getPage(slug)
      .then((result) => {
        if (!alive) return;
        setPage(result.page);
        const title = pickLocale(locale, result.page.titleEn, result.page.titleTa);
        const description = pickLocale(locale, result.page.descriptionEn, result.page.descriptionTa);
        if (title) document.title = `${title} · Oliyaruvi`;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        if (description) meta.setAttribute("content", description);
      })
      .catch(() => {
        if (!alive) return;
        setPage(null);
        setError("This page is not available.");
      });
    return () => {
      alive = false;
    };
  }, [slug, locale]);

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
        <h1 className="text-4xl text-ink">Page not found</h1>
        <p className="mt-4 text-muted">{error}</p>
      </section>
    );
  }

  if (!page) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
        <p className="text-muted">Loading…</p>
      </section>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-section px-4 py-section md:px-6">
      {page.sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionView({ section }: { section: PublicSection }) {
  const animation = asString(section.animation.type, "fade") as "none" | "fade" | "rise";
  const alignment = asString(section.style.alignment, "left");
  return (
    <Reveal animation={animation}>
      <section
        className={alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : ""}
        style={{
          background: typeof section.style.background === "string" ? section.style.background : undefined,
        }}
      >
        {renderBlock(section.blockType, section.content)}
      </section>
    </Reveal>
  );
}
