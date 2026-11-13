import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField } from "../../components/ui/Fields";
import { ApiError, getAdminNavigation, saveAdminNavigation } from "../../lib/api";
import type { NavItem } from "../../lib/types";

function blankItem(sortOrder: number): NavItem {
  return {
    labelEn: "New link",
    labelTa: "",
    href: "/",
    linkType: "internal",
    sortOrder,
    openInNewTab: false,
    children: [],
  };
}

export function NavigationPage() {
  const { token } = useAdmin();
  const [header, setHeader] = useState<NavItem[]>([]);
  const [footer, setFooter] = useState<NavItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminNavigation(token)
      .then((data) => {
        if (!active) return;
        setHeader(data.header);
        setFooter(data.footer);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load navigation");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveAdminNavigation(token, {
        header: header.map((item, index) => ({ ...item, sortOrder: index })),
        footer: footer.map((item, index) => ({ ...item, sortOrder: index })),
      });
      setHeader(saved.header);
      setFooter(saved.footer);
      setMessage("Navigation published to the public site.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid max-w-4xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">Navigation</h1>
          <p className="mt-2 text-muted">Header and footer menus. Mobile uses the same header items.</p>
        </div>
        <Button disabled={pending} onClick={() => void onSave()}>
          {pending ? "Saving" : "Save navigation"}
        </Button>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <MenuEditor title="Header" items={header} onChange={setHeader} />
      <MenuEditor title="Footer" items={footer} onChange={setFooter} />
    </div>
  );
}

function MenuEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
}) {
  function update(index: number, patch: Partial<NavItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <section className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl text-gold">{title}</h2>
        <Button variant="outline" onClick={() => onChange([...items, blankItem(items.length)])}>
          Add item
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="grid gap-3 rounded-2xl border border-gold/15 bg-background/40 p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              id={`${title}-en-${index}`}
              label="Label EN"
              value={item.labelEn}
              onChange={(event) => update(index, { labelEn: event.target.value })}
            />
            <Field
              id={`${title}-ta-${index}`}
              label="Label TA"
              value={item.labelTa}
              onChange={(event) => update(index, { labelTa: event.target.value })}
            />
            <Field
              id={`${title}-href-${index}`}
              label="URL"
              value={item.href}
              onChange={(event) => update(index, { href: event.target.value })}
            />
            <SelectField
              id={`${title}-type-${index}`}
              label="Link type"
              value={item.linkType}
              onChange={(event) => update(index, { linkType: event.target.value as NavItem["linkType"] })}
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </SelectField>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={item.openInNewTab}
              onChange={(event) => update(index, { openInNewTab: event.target.checked })}
            />
            Open in new tab
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => move(index, -1)}>
              Up
            </Button>
            <Button variant="outline" onClick={() => move(index, 1)}>
              Down
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                update(index, {
                  children: [...item.children, blankItem(item.children.length)],
                })
              }
            >
              Add child
            </Button>
            <Button variant="outline" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
          {item.children.length > 0 ? (
            <div className="grid gap-2 border-l border-gold/20 pl-3">
              {item.children.map((child, childIndex) => (
                <div key={childIndex} className="grid gap-2 md:grid-cols-3">
                  <Field
                    id={`${title}-child-en-${index}-${childIndex}`}
                    label="Child EN"
                    value={child.labelEn}
                    onChange={(event) => {
                      const children = item.children.map((entry, i) =>
                        i === childIndex ? { ...entry, labelEn: event.target.value } : entry,
                      );
                      update(index, { children });
                    }}
                  />
                  <Field
                    id={`${title}-child-href-${index}-${childIndex}`}
                    label="Child URL"
                    value={child.href}
                    onChange={(event) => {
                      const children = item.children.map((entry, i) =>
                        i === childIndex ? { ...entry, href: event.target.value } : entry,
                      );
                      update(index, { children });
                    }}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() =>
                        update(index, {
                          children: item.children.filter((_, i) => i !== childIndex),
                        })
                      }
                    >
                      Remove child
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
