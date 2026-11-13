import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../../lib/api";
import { pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import { whatsAppHref } from "../../lib/phone";
import type { Product } from "../../lib/types";
import { useSiteSettings } from "../../components/public/PublicLayout";
import { Button } from "../../components/ui/Button";
import { StudioForm } from "../../components/public/StudioForm";

export function ProductPage({ catalogue }: { catalogue: "printing" | "gifts" }) {
  const { slug = "" } = useParams();
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const back = catalogue === "gifts" ? "/gifts" : "/printing";

  useEffect(() => {
    let alive = true;
    getProduct(slug)
      .then((result) => {
        if (!alive) return;
        if (result.product.catalogue !== catalogue) {
          setError("Product not found.");
          return;
        }
        setProduct(result.product);
        document.title = `${pickLocale(locale, result.product.nameEn, result.product.nameTa)} · Oliyaruvi`;
      })
      .catch(() => {
        if (!alive) return;
        setError("Product not found.");
      });
    return () => {
      alive = false;
    };
  }, [slug, catalogue, locale]);

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
        <h1 className="text-4xl">Product not found</h1>
        <Link className="mt-6 inline-block text-gold" to={back}>
          Back
        </Link>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-section md:px-6">
        <p className="text-muted">Loading…</p>
      </section>
    );
  }

  const name = pickLocale(locale, product.nameEn, product.nameTa);
  const price =
    product.showPrice && product.variants.some((variant) => variant.priceLkr != null)
      ? `Rs. ${product.variants.find((variant) => variant.priceLkr != null)?.priceLkr}`
      : "Ask for price";

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-section md:grid-cols-2 md:px-6">
      <div>
        <Link className="text-sm text-gold no-underline" to={back}>
          ← Back
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold">{product.categoryNameEn}</p>
        <h1 className="mt-3 text-4xl text-ink">{name}</h1>
        <p className="mt-4 text-muted">{pickLocale(locale, product.descriptionEn, product.descriptionTa)}</p>
        <p className="mt-4 text-light-gold">{price}</p>
        {product.variants.length > 0 ? (
          <ul className="mt-6 grid gap-2 text-sm text-muted">
            {product.variants.map((variant) => (
              <li key={variant.id}>
                {[variant.nameEn, variant.size, variant.material].filter(Boolean).join(" · ") || "Variant"}
                {product.showPrice && variant.priceLkr != null ? ` · Rs. ${variant.priceLkr}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6">
          <Button
            variant="whatsapp"
            href={`${whatsAppHref(settings.whatsappNumber)}?text=${encodeURIComponent(`Hello, I would like to enquire about ${name}`)}`}
          >
            WhatsApp enquiry
          </Button>
        </div>
      </div>
      <div className="card">
        <h2 className="mb-4 text-2xl text-ink">Enquire about this product</h2>
        <StudioForm purpose="contact" productId={product.id} productName={name} />
      </div>
    </section>
  );
}
