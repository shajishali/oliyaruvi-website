import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, SelectField, TextAreaField } from "../../components/ui/Fields";
import { ApiError, getAdminOrders, saveAdminOrder } from "../../lib/api";

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  productionStatus: "queued" | "in_progress" | "ready" | "done";
  deliveryStatus: "none" | "pickup" | "out_for_delivery" | "delivered";
  notes: string;
  lines: { id?: string; productId: string | null; label: string; quantity: number; unitPriceLkr: number | null }[];
};

const blank: Omit<Order, "id"> = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  paymentStatus: "unpaid",
  productionStatus: "queued",
  deliveryStatus: "none",
  notes: "",
  lines: [{ productId: null, label: "", quantity: 1, unitPriceLkr: null }],
};

export function OrdersAdminPage() {
  const { token } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [draft, setDraft] = useState<Order | (Omit<Order, "id"> & { id?: string })>({ ...blank });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = await getAdminOrders(token);
    setOrders(data.orders as Order[]);
  }

  useEffect(() => {
    let active = true;
    getAdminOrders(token)
      .then((data) => {
        if (active) setOrders(data.orders as Order[]);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load orders");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setError("");
    setMessage("");
    try {
      await saveAdminOrder(token, draft, draft.id);
      setDraft({ ...blank });
      await refresh();
      setMessage("Order saved. Statuses are internal workflow only.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    }
  }

  return (
    <div className="grid max-w-5xl gap-6">
      <div>
        <h1 className="font-heading text-4xl">Orders</h1>
        <p className="mt-2 text-muted">Customer lines, payment/production/delivery labels. No gateway.</p>
      </div>
      {error ? <p className="text-light-gold" role="alert">{error}</p> : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4 md:grid-cols-2">
        <Field id="o-name" label="Customer name" value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} />
        <Field id="o-phone" label="Phone" value={draft.customerPhone} onChange={(e) => setDraft({ ...draft, customerPhone: e.target.value })} />
        <Field id="o-email" label="Email" value={draft.customerEmail} onChange={(e) => setDraft({ ...draft, customerEmail: e.target.value })} />
        <Field
          id="o-line"
          label="Line item label"
          value={draft.lines[0]?.label || ""}
          onChange={(e) => setDraft({ ...draft, lines: [{ ...draft.lines[0], label: e.target.value }] })}
        />
        <Field
          id="o-qty"
          label="Quantity"
          type="number"
          value={draft.lines[0]?.quantity || 1}
          onChange={(e) => setDraft({ ...draft, lines: [{ ...draft.lines[0], quantity: Number(e.target.value) || 1 }] })}
        />
        <Field
          id="o-price"
          label="Unit price LKR"
          value={draft.lines[0]?.unitPriceLkr ?? ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              lines: [{ ...draft.lines[0], unitPriceLkr: e.target.value ? Number(e.target.value) : null }],
            })
          }
        />
        <SelectField id="o-pay" label="Payment status" value={draft.paymentStatus} onChange={(e) => setDraft({ ...draft, paymentStatus: e.target.value as Order["paymentStatus"] })}>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </SelectField>
        <SelectField id="o-prod" label="Production status" value={draft.productionStatus} onChange={(e) => setDraft({ ...draft, productionStatus: e.target.value as Order["productionStatus"] })}>
          <option value="queued">Queued</option>
          <option value="in_progress">In progress</option>
          <option value="ready">Ready</option>
          <option value="done">Done</option>
        </SelectField>
        <SelectField id="o-del" label="Delivery / pickup" value={draft.deliveryStatus} onChange={(e) => setDraft({ ...draft, deliveryStatus: e.target.value as Order["deliveryStatus"] })}>
          <option value="none">None</option>
          <option value="pickup">Pickup</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
        </SelectField>
        <TextAreaField id="o-notes" label="Notes" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <div className="md:col-span-2">
          <Button onClick={() => void onSave()}>{draft.id ? "Update order" : "Create order"}</Button>
        </div>
      </div>
      <div className="grid gap-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[1.25rem] border border-gold/20 bg-surface/30 p-4">
            <h2 className="text-xl text-gold">{order.customerName}</h2>
            <p className="text-sm text-muted">
              {order.paymentStatus} · {order.productionStatus} · {order.deliveryStatus}
            </p>
            <Button variant="outline" className="mt-3" onClick={() => setDraft(order)}>
              Edit
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
