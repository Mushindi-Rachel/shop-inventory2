"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { money } from "@/lib/format";

export default function NewLayawayPage() {
  return (
    <Suspense fallback={<div className="text-ink-500">Loading…</div>}>
      <NewLayawayForm />
    </Suspense>
  );
}

function NewLayawayForm() {
  const router = useRouter();
  const search = useSearchParams();
  const preselectedId = search.get("productId");

  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [initialPayment, setInitialPayment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preselectedId) {
      fetch(`/api/products/${preselectedId}`).then((r) => r.json()).then((p) => {
        setSelected(p);
        setTotalPrice(String(p.sellingPrice));
      });
    }
  }, [preselectedId]);

  useEffect(() => {
    if (!q || selected) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(q)}&status=active`)
        .then((r) => r.json())
        .then(setResults);
    }, 250);
    return () => clearTimeout(t);
  }, [q, selected]);

  function pick(p: any) {
    setSelected(p);
    setTotalPrice(String(p.sellingPrice));
    setResults([]);
    setQ("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) return setError("Pick a product first");
    if (!customerName.trim()) return setError("Customer name is required");
    setSaving(true);
    const res = await fetch("/api/layaway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerPhone,
        productId: selected.id,
        totalPrice: parseFloat(totalPrice) || 0,
        initialPayment: parseFloat(initialPayment) || 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const order = await res.json();
      router.push(`/layaway/${order.id}`);
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  const inputClass = "w-full rounded border border-ink-200 bg-white px-3 py-2.5 tap-target focus:outline-none focus:ring-2 focus:ring-tag";

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink-900">New layaway order</h1>

      <div className="bg-white border border-ink-200 rounded-lg p-4">
        <label className="text-sm text-ink-600 block mb-1.5">Product</label>
        {selected ? (
          <div className="flex items-center gap-3 border border-ink-200 rounded p-2">
            <div className="w-12 h-12 bg-ink-100 rounded overflow-hidden shrink-0">
              {selected.imagePath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.imagePath} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{selected.name || selected.code}</div>
              <div className="font-mono text-xs text-ink-500">{selected.code}</div>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-rust text-sm">
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item name or code…" className={inputClass} />
            {results.length > 0 && (
              <div className="absolute z-10 bg-white border border-ink-200 rounded shadow-lg mt-1 w-full max-h-64 overflow-auto">
                {results.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => pick(p)}
                    className="w-full text-left px-3 py-2 hover:bg-ink-50 flex items-center justify-between text-sm"
                  >
                    <span>
                      <span className="font-mono text-ink-500 mr-2">{p.code}</span>
                      {p.name || p.categoryName}
                    </span>
                    <span className="text-ink-500">{money(p.sellingPrice)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="bg-white border border-ink-200 rounded-lg p-4 space-y-4">
        <div>
          <label className="text-sm text-ink-600 block mb-1.5">Customer name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-ink-600 block mb-1.5">Phone (optional)</label>
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Agreed total price</label>
            <input type="number" step="0.01" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Deposit today (optional)</label>
            <input type="number" step="0.01" value={initialPayment} onChange={(e) => setInitialPayment(e.target.value)} className={inputClass} />
          </div>
        </div>

        {error && <p className="text-rust text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded px-5 py-2.5 tap-target disabled:opacity-60">
          {saving ? "Saving…" : "Create layaway order"}
        </button>
        <p className="text-xs text-ink-400">The item will be marked "Reserved" and taken off the active shelf until it's picked up or the order is cancelled.</p>
      </form>
    </div>
  );
}
