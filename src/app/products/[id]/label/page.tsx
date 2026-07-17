"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { money } from "@/lib/format";

export default function LabelPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [qr, setQr] = useState<string>("");
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r) => r.json()).then((p) => {
      setProduct(p);
      QRCode.toDataURL(p.code, { margin: 1, width: 200 }).then(setQr);
    });
  }, [id]);

  if (!product) return <div className="p-6 text-ink-500">Loading…</div>;

  return (
    <div>
      <div className="print:hidden flex items-center gap-3 mb-5">
        <h1 className="font-display text-xl font-bold text-ink-900">Label — {product.code}</h1>
        <label className="text-sm text-ink-600 flex items-center gap-1.5 ml-auto">
          Copies
          <input
            type="number"
            min={1}
            max={20}
            value={copies}
            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 border border-ink-200 rounded px-2 py-1"
          />
        </label>
        <button onClick={() => window.print()} className="bg-tag text-ink-950 font-semibold rounded px-4 py-2.5 tap-target">
          Print
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} className="border border-ink-300 rounded-lg p-3 flex flex-col items-center text-center bg-white print:break-inside-avoid">
            {qr && <img src={qr} alt="QR" className="w-24 h-24" />}
            <div className="font-mono font-bold text-sm mt-1 tracking-wide">{product.code}</div>
            <div className="text-xs text-ink-600 line-clamp-1">{product.name || product.categoryName}</div>
            <div className="font-display font-bold text-lg text-ink-900 mt-1">{money(product.sellingPrice)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
