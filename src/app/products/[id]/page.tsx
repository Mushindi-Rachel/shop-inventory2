"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { money } from "@/lib/format";
import SellModal from "@/components/SellModal";

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-ink-500">Loading…</div>}>
      <ProductDetail />
    </Suspense>
  );
}

function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showSell, setShowSell] = useState(false);
  const [saving, setSaving] = useState(false);
  const justCreated = search.get("created") === "1";

  async function load() {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProduct(data);
      setForm(data);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save() {
    setSaving(true);
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        origin: form.origin,
        costPrice: parseFloat(form.costPrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        quantity: parseInt(form.quantity, 10) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold, 10) || 0,
        notes: form.notes,
      }),
    });
    setSaving(false);
    setEditing(false);
    load();
  }

  async function remove() {
    if (!confirm("Delete this item permanently? This can't be undone.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.push("/products");
  }

  if (!product) return <div className="text-ink-500">Loading…</div>;

  const inputClass = "w-full rounded border border-ink-200 bg-white px-3 py-2 tap-target focus:outline-none focus:ring-2 focus:ring-tag";

  return (
    <div className="max-w-2xl space-y-4">
      {justCreated && (
        <div className="bg-leaf-light text-leaf border border-leaf rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          <span>Item saved — code <span className="font-mono font-semibold">{product.code}</span> generated.</span>
          <Link href={`/products/${id}/label`} className="font-semibold underline">Print label →</Link>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Link href="/products" className="text-ink-500 hover:text-ink-800">← Shelf</Link>
      </div>

      <div className="bg-white border border-ink-200 rounded-lg overflow-hidden">
        <div className="aspect-video bg-ink-100 flex items-center justify-center">
          {product.imagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imagePath} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-ink-300">No photo</span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-ink-500 text-sm">{product.code}</span>
              <h1 className="font-display text-xl font-bold text-ink-900">{product.name || `${product.categoryName} item`}</h1>
              <span className="text-sm text-ink-500">{product.categoryName}{product.origin ? ` · ${product.origin}` : ""}</span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                product.status === "active"
                  ? "bg-leaf-light text-leaf"
                  : product.status === "reserved"
                  ? "bg-tag-light text-tag-dark"
                  : "bg-ink-100 text-ink-500"
              }`}
            >
              {product.status === "active" ? "On shelf" : product.status === "reserved" ? "Reserved" : "Sold out"}
            </span>
          </div>

          {!editing ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-ink-500">Cost price</div>
                  <div className="font-semibold text-ink-900">{money(product.costPrice)}</div>
                </div>
                <div>
                  <div className="text-ink-500">Selling price</div>
                  <div className="font-semibold text-ink-900">{money(product.sellingPrice)}</div>
                </div>
                <div>
                  <div className="text-ink-500">In stock</div>
                  <div className="font-semibold text-ink-900">{product.quantity}</div>
                </div>
                <div>
                  <div className="text-ink-500">Margin</div>
                  <div className="font-semibold text-ink-900">{money(product.sellingPrice - product.costPrice)}</div>
                </div>
              </div>
              {product.notes && (
                <div className="text-sm">
                  <div className="text-ink-500">Notes</div>
                  <div className="text-ink-800">{product.notes}</div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {product.status === "active" && product.quantity > 0 && (
                  <button onClick={() => setShowSell(true)} className="bg-leaf text-white font-semibold rounded px-4 py-2.5 tap-target">
                    Mark Sold
                  </button>
                )}
                {product.status === "active" && (
                  <Link href={`/layaway/new?productId=${product.id}`} className="bg-tag text-ink-950 font-semibold rounded px-4 py-2.5 tap-target">
                    Start Layaway
                  </Link>
                )}
                <Link href={`/products/${id}/label`} className="border border-ink-200 text-ink-700 font-medium rounded px-4 py-2.5 tap-target">
                  Print Label
                </Link>
                <button onClick={() => setEditing(true)} className="border border-ink-200 text-ink-700 font-medium rounded px-4 py-2.5 tap-target">
                  Edit
                </button>
                <button onClick={remove} className="border border-rust text-rust font-medium rounded px-4 py-2.5 tap-target">
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-ink-600 block mb-1">Name</label>
                <input className={inputClass} value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-ink-600 block mb-1">Cost price</label>
                  <input type="number" step="0.01" className={inputClass} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-ink-600 block mb-1">Selling price</label>
                  <input type="number" step="0.01" className={inputClass} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-ink-600 block mb-1">Quantity</label>
                  <input type="number" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-ink-600 block mb-1">Low stock alert</label>
                  <input type="number" className={inputClass} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-ink-600 block mb-1">Notes</label>
                <textarea className={inputClass} rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="bg-tag text-ink-950 font-semibold rounded px-4 py-2.5 tap-target">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button onClick={() => { setEditing(false); setForm(product); }} className="border border-ink-200 rounded px-4 py-2.5 tap-target">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSell && (
        <SellModal
          product={product}
          onClose={() => setShowSell(false)}
          onSold={() => {
            setShowSell(false);
            load();
          }}
        />
      )}
    </div>
  );
}
