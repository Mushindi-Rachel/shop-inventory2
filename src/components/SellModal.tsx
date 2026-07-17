"use client";

import { useState } from "react";
import { money } from "@/lib/format";

export default function SellModal({
  product,
  onClose,
  onSold,
}: {
  product: { id: number; name: string | null; code: string; quantity: number; sellingPrice: number };
  onClose: () => void;
  onSold: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/products/${product.id}/sell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    setLoading(false);
    if (res.ok) {
      onSold();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-lg text-ink-900">Mark as sold</h3>
        <p className="text-sm text-ink-500 mt-1">
          <span className="font-mono">{product.code}</span> — {product.name || "Unnamed item"}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-ink-600">Quantity sold</label>
          <div className="flex items-center border border-ink-200 rounded">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 text-lg tap-target"
            >
              −
            </button>
            <input
              type="number"
              value={qty}
              min={1}
              max={product.quantity}
              onChange={(e) => setQty(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-14 text-center border-x border-ink-200 h-10"
            />
            <button
              onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
              className="w-10 h-10 text-lg tap-target"
            >
              +
            </button>
          </div>
          <span className="text-xs text-ink-400">of {product.quantity} in stock</span>
        </div>

        <div className="mt-3 text-sm text-ink-600">
          Total: <span className="font-semibold text-ink-900">{money(product.sellingPrice * qty)}</span>
        </div>

        {error && <p className="text-rust text-sm mt-2">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-ink-200 rounded py-2.5 tap-target text-ink-600">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 bg-leaf text-white font-semibold rounded py-2.5 tap-target disabled:opacity-60"
          >
            {loading ? "Saving…" : "Confirm sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
