import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductCategories, getProducts } from "../../lib/api";
import { asBoolean, asNumber, asString, localizedField, pickLocale } from "../../lib/content";
import { useLocale } from "../../lib/locale";
import type { Product, ProductCategory } from "../../lib/types";
import { useSiteSettings } from "../public/PublicLayout";
import { Button } from "../ui/Button";
import { EmptyState } from "../public/EmptyState";
import { whatsAppHref } from "../../lib/phone";

export function ProductGridBlock({ content }: { content: Record<string, unknown> }) {
  const { locale } = useLocale();
  const settings = useSiteSettings();
  const heading = localizedField(content, locale, "heading");
  const catalogue = asString(content.catalogue, "printing") as "printing" | "gifts";
  const featuredOnly = asBoolean(content.featuredOnly, false);
  const limit = asNumber(content.limit, 12);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getProductCategories(catalogue),
      getProducts({ catalogue, featured: featuredOnly, limit }),
    ])
      .then(([categoryResult, productResult]) => {
        if (!alive) return;
        setCategories(categoryResult.categories);
        setProducts(productResult.products);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
        setProducts([]);
      });
    return () => {
      alive = false;
    };
  }, [catalogue, featuredOnly, limit]);

  return (
    <div>
      {heading ? <h2 className="mb-6 text-3xl text-ink">{heading}</h2> : null}

      {products.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, limit).map((category) => (
            <div key={category.id} className="card">
              <h3 className="text-xl text-ink">{pickLocale(locale, category.nameEn, category.nameTa)}</h3>
              <p className="mt-3 text-sm text-muted">Ask for price</p>
              <div className="mt-4">
                <Button href={`/contact?service=${encodeURIComponent(category.nameEn)}`} variant="outline">
                  Enquire
                </Button>
              </div>
            </div>
          ))}
          {categories.length === 0 ? (
            <EmptyState message="Products will appear here after they are published." />
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const name = pickLocale(locale, product.nameEn, product.nameTa);
            const price =
              product.showPrice && product.variants.some((variant) => variant.priceLkr != null)
                ? `Rs. ${product.variants.find((variant) => variant.priceLkr != null)?.priceLkr}`
                : "Ask for price";
            const base = product.catalogue === "gifts" ? "/gifts" : "/printing";
            return (
              <article key={product.id} className="card flex flex-col">
                <p className="text-xs uppercase tracking-[0.14em] text-gold">{product.categoryNameEn}</p>
                <h3 className="mt-3 text-2xl text-ink">
                  <Link className="no-underline text-inherit" to={`${base}/${product.slug}`}>
                    {name}
                  </Link>
                </h3>
                {product.descriptionEn || product.descriptionTa ? (
                  <p className="mt-2 text-sm text-muted">
                    {pickLocale(locale, product.descriptionEn, product.descriptionTa)}
                  </p>
                ) : null}
                <p className="mt-4 text-sm text-light-gold">{price}</p>
                <div className="mt-auto flex flex-wrap gap-3 pt-4">
                  <Button href={`/contact?service=${encodeURIComponent(name)}`} variant="outline">
                    {pickLocale(locale, product.enquiryLabelEn, product.enquiryLabelTa) || "Enquire"}
                  </Button>
                  <Button
                    variant="whatsapp"
                    href={`${whatsAppHref(settings.whatsappNumber)}?text=${encodeURIComponent(`Hello, I would like to enquire about ${name}`)}`}
                  >
                    WhatsApp
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
