"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { money } from "@/lib/format";
import SellModal from "@/components/SellModal";

type Product = {
  id: number;
  code: string;
  categoryId: number;
  categoryName: string;
  name: string | null;
  origin: string | null;
  imagePath: string | null;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  status: string;
  notes: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [sellTarget, setSellTarget] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    if (status) params.set("status", status);
    const res = await fetch(`/api/products?${params.toString()}`);
    setProducts(await res.json());
    setLoading(false);
  }, [q, categoryId, status]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Shelf</h1>
          <p className="text-ink-500 text-sm mt-1">{products.length} items showing</p>
        </div>
        <Link
          href="/products/new"
          className="hidden md:inline-flex bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded px-4 py-2.5 tap-target"
        >
          + Add Item
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, code, or note…"
          className="flex-1 rounded border border-ink-200 bg-white px-3 py-2.5 tap-target focus:outline-none focus:ring-2 focus:ring-tag"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border border-ink-200 bg-white px-3 py-2.5 tap-target"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-ink-200 bg-white px-3 py-2.5 tap-target"
        >
          <option value="active">On shelf</option>
          <option value="reserved">Reserved (layaway)</option>
          <option value="sold_out">Sold out</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <p className="text-ink-400 text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-ink-200">
          <p className="text-ink-500">No items match. Try a different search, or add something new.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-ink-200 overflow-hidden flex flex-col">
              <Link href={`/products/${p.id}`} className="block">
                <div className="aspect-square bg-ink-100 flex items-center justify-center overflow-hidden">
                  {p.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imagePath} alt={p.name || p.code} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-ink-300 text-xs">No photo</span>
                  )}
                </div>
              </Link>
              <div className="p-3 flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-500">{p.code}</span>
                  {p.status === "sold_out" && (
                    <span className="text-[10px] bg-ink-100 text-ink-500 px-1.5 py-0.5 rounded">SOLD</span>
                  )}
                  {p.status === "reserved" && (
                    <span className="text-[10px] bg-tag-light text-tag-dark px-1.5 py-0.5 rounded">RESERVED</span>
                  )}
                </div>
                <Link href={`/products/${p.id}`} className="text-sm font-medium text-ink-900 leading-snug line-clamp-2">
                  {p.name || `${p.categoryName} item`}
                </Link>
                <span className="text-xs text-ink-400">{p.categoryName}{p.origin ? ` · ${p.origin}` : ""}</span>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="font-display font-bold text-ink-900">{money(p.sellingPrice)}</span>
                  <span className={`text-xs font-medium ${p.quantity <= p.lowStockThreshold ? "text-rust" : "text-ink-500"}`}>
                    {p.quantity} in stock
                  </span>
                </div>
                {p.status === "active" && p.quantity > 0 && (
                  <button
                    onClick={() => setSellTarget(p)}
                    className="mt-2 w-full bg-leaf text-white text-sm font-semibold rounded py-2 tap-target hover:opacity-90"
                  >
                    Mark Sold
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/products/new"
        className="md:hidden fixed bottom-20 right-4 bg-tag text-ink-950 rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg"
      >
        +
      </Link>

      {sellTarget && (
        <SellModal
          product={sellTarget}
          onClose={() => setSellTarget(null)}
          onSold={() => {
            setSellTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}
