"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { money } from "@/lib/format";

export default function LayawayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/layaway/${id}`);
    setOrder(await res.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError("Enter a valid amount");
    setSaving(true);
    const res = await fetch(`/api/layaway/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, note }),
    });
    setSaving(false);
    if (res.ok) {
      setAmount("");
      setNote("");
      load();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function markPickedUp() {
    if (!confirm("Mark this item as picked up? It will be removed from inventory.")) return;
    await fetch(`/api/layaway/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "picked_up" }),
    });
    load();
  }

  async function cancelOrder() {
    if (!confirm("Cancel this layaway order? The item goes back on the shelf.")) return;
    await fetch(`/api/layaway/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    router.push("/layaway");
  }

  if (!order) return <div className="text-ink-500">Loading…</div>;

  const inputClass = "w-full rounded border border-ink-200 bg-white px-3 py-2.5 tap-target focus:outline-none focus:ring-2 focus:ring-tag";

  return (
    <div className="max-w-xl space-y-5">
      <Link href="/layaway" className="text-sm text-ink-500 hover:text-ink-800">← Layaway</Link>

      <div className="bg-white border border-ink-200 rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">{order.customerName}</h1>
            {order.customerPhone && <p className="text-sm text-ink-500">{order.customerPhone}</p>}
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              order.status === "picked_up"
                ? "bg-ink-100 text-ink-500"
                : order.status === "completed"
                ? "bg-leaf-light text-leaf"
                : "bg-tag-light text-tag-dark"
            }`}
          >
            {order.status === "picked_up" ? "PICKED UP" : order.status === "completed" ? "FULLY PAID" : "PAYING"}
          </span>
        </div>

        <div className="flex items-center gap-3 border border-ink-100 rounded p-3">
          <div className="w-14 h-14 bg-ink-100 rounded overflow-hidden shrink-0">
            {order.productImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.productImage} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{order.productName || order.productCode}</div>
            <div className="font-mono text-xs text-ink-500">{order.productCode}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-center">
          <div className="bg-ink-50 rounded p-2">
            <div className="text-ink-500 text-xs">Total</div>
            <div className="font-semibold">{money(order.totalPrice)}</div>
          </div>
          <div className="bg-leaf-light rounded p-2">
            <div className="text-leaf text-xs">Paid</div>
            <div className="font-semibold text-leaf">{money(order.amountPaid)}</div>
          </div>
          <div className="bg-rust-light rounded p-2">
            <div className="text-rust text-xs">Balance</div>
            <div className="font-semibold text-rust">{money(order.balance)}</div>
          </div>
        </div>
        <div className="w-full bg-ink-100 rounded-full h-2">
          <div className="bg-tag h-2 rounded-full" style={{ width: `${Math.min(100, (order.amountPaid / order.totalPrice) * 100)}%` }} />
        </div>

        {order.status !== "picked_up" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {order.status === "completed" && (
              <button onClick={markPickedUp} className="bg-leaf text-white font-semibold rounded px-4 py-2.5 tap-target">
                Mark Picked Up
              </button>
            )}
            <button onClick={cancelOrder} className="border border-rust text-rust font-medium rounded px-4 py-2.5 tap-target">
              Cancel Order
            </button>
          </div>
        )}
      </div>

      {order.status === "pending" && (
        <form onSubmit={addPayment} className="bg-white border border-ink-200 rounded-lg p-4 space-y-3">
          <h2 className="font-display font-semibold text-ink-900">Record a payment</h2>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
            <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </div>
          {error && <p className="text-rust text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded px-4 py-2.5 tap-target">
            {saving ? "Saving…" : "Add payment"}
          </button>
        </form>
      )}

      <div className="bg-white border border-ink-200 rounded-lg p-4">
        <h2 className="font-display font-semibold text-ink-900 mb-2">Payment history</h2>
        {order.payments.length === 0 ? (
          <p className="text-sm text-ink-400">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {order.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="text-ink-800">{new Date(p.paidAt).toLocaleDateString()} {p.note ? `— ${p.note}` : ""}</div>
                </div>
                <div className="font-semibold text-ink-900">{money(p.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
