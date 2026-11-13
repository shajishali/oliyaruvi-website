import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import { ApiError, deleteAdminProduct, getAdminProducts, saveAdminProduct } from "../../lib/api";

type Category = { id: string; nameEn: string; catalogue: "printing" | "gifts" };
type Product = {
  id: string;
  slug: string;
  categoryId: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  enquiryLabelEn: string;
  enquiryLabelTa: string;
  sortOrder: number;
  isFeatured: boolean;
  isAvailable: boolean;
  showPrice: boolean;
  variants: { id?: string; nameEn: string; nameTa: string; size: string; material: string; priceLkr: number | null; isAvailable: boolean; sortOrder: number }[];
  images: { mediaId: string; sortOrder: number }[];
};

const blank = (_catalogue: "printing" | "gifts"): Omit<Product, "id"> => ({
  slug: "",
  categoryId: "",
  nameEn: "",
  nameTa: "",
  descriptionEn: "",
  descriptionTa: "",
  enquiryLabelEn: "Enquire",
  enquiryLabelTa: "",
  sortOrder: 0,
  isFeatured: false,
  isAvailable: true,
  showPrice: false,
  variants: [{ nameEn: "Standard", nameTa: "", size: "", material: "", priceLkr: null, isAvailable: true, sortOrder: 0 }],
  images: [],
});

export function ProductsAdminPage({ catalogue }: { catalogue: "printing" | "gifts" }) {
  const { token } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<Product | (Omit<Product, "id"> & { id?: string })>(blank(catalogue));
  const [imageIds, setImageIds] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminProducts(token, catalogue);
    setProducts(data.products as Product[]);
    setCategories(data.categories as Category[]);
  }

  useEffect(() => {
    let active = true;
    getAdminProducts(token, catalogue)
      .then((data) => {
        if (!active) return;
        setProducts(data.products as Product[]);
        setCategories(data.categories as Category[]);
        setDraft((current) => ({
          ...current,
          categoryId: current.categoryId || (data.categories[0] as Category | undefined)?.id || "",
        }));
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load products");
      });
    return () => {
      active = false;
    };
  }, [token, catalogue]);

  async function onSave() {
    setError("");
    setMessage("");
    try {
      const images = imageIds
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((mediaId, sortOrder) => ({ mediaId, sortOrder }));
      const variants = [
        {
          ...draft.variants[0],
          priceLkr: price ? Number(price) : null,
        },
      ];
      await saveAdminProduct(
        token,
        {
          ...draft,
          images: images.length ? images : draft.images,
          variants,
        },
        draft.id,
      );
      setDraft({ ...blank(catalogue), categoryId: categories[0]?.id || "" });
      setImageIds("");
      setPrice("");
      await refresh();
      setMessage("Product saved.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    }
  }

  return (
    <div className="grid max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">{catalogue === "printing" ? "Printing products" : "Custom gifts"}</h1>
        <p className="mt-2 text-muted">Hidden price shows “Ask for price” on the public card. No payment capture.</p>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
        <Field id="p-name" label="Name EN" value={draft.nameEn} onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })} />
        <Field id="p-slug" label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        <SelectField id="p-cat" label="Category" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </SelectField>
        <Field id="p-price" label="Optional price LKR" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Field id="p-size" label="Size" value={draft.variants[0]?.size || ""} onChange={(e) => setDraft({ ...draft, variants: [{ ...draft.variants[0], size: e.target.value }] })} />
        <Field id="p-material" label="Material" value={draft.variants[0]?.material || ""} onChange={(e) => setDraft({ ...draft, variants: [{ ...draft.variants[0], material: e.target.value }] })} />
        <TextAreaField id="p-desc" label="Description EN" rows={3} value={draft.descriptionEn} onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })} />
        <TextAreaField id="p-images" label="Image media IDs" rows={3} value={imageIds} onChange={(e) => setImageIds(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.showPrice} onChange={(e) => setDraft({ ...draft, showPrice: e.target.checked })} />
          Show price
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={draft.isAvailable} onChange={(e) => setDraft({ ...draft, isAvailable: e.target.checked })} />
          Available
        </label>
        <div className="md:col-span-2">
          <Button onClick={() => void onSave()}>{draft.id ? "Update product" : "Add product"}</Button>
        </div>
      </div>
      <div className="grid gap-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h2 className="text-xl text-gold">{product.nameEn}</h2>
            <p className="text-sm text-muted">
              /{product.slug} · {product.showPrice ? "shows price" : "ask for price"} · {product.isAvailable ? "available" : "hidden"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDraft(product);
                  setImageIds(product.images.map((image) => image.mediaId).join(", "));
                  setPrice(product.variants[0]?.priceLkr != null ? String(product.variants[0].priceLkr) : "");
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  void (async () => {
                    await deleteAdminProduct(token, product.id);
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
