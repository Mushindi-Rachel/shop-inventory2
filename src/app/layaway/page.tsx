"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/format";

export default function LayawayPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/layaway?status=${status}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d);
        setLoading(false);
      });
  }, [status]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Layaway</h1>
          <p className="text-ink-500 text-sm mt-1">Customers paying for items in installments.</p>
        </div>
        <Link href="/layaway/new" className="hidden md:inline-flex bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded px-4 py-2.5 tap-target">
          + New Layaway
        </Link>
      </div>

      <div className="flex gap-2">
        {[
          ["pending", "Still paying"],
          ["completed", "Fully paid"],
          ["picked_up", "Picked up"],
          ["all", "All"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setStatus(val)}
            className={`text-sm px-3 py-1.5 rounded-full border tap-target ${
              status === val ? "bg-ink-900 text-white border-ink-900" : "border-ink-200 text-ink-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-400 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-ink-200">
          <p className="text-ink-500">No layaway orders here yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/layaway/${o.id}`} className="bg-white border border-ink-200 rounded-lg p-4 flex gap-3">
              <div className="w-16 h-16 bg-ink-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                {o.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.productImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-ink-300 text-[10px]">No photo</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900 truncate">{o.customerName}</div>
                <div className="text-xs text-ink-500 truncate">{o.productName || o.productCode}</div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-ink-600">{money(o.amountPaid)} / {money(o.totalPrice)}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      o.status === "picked_up"
                        ? "bg-ink-100 text-ink-500"
                        : o.status === "completed"
                        ? "bg-leaf-light text-leaf"
                        : "bg-tag-light text-tag-dark"
                    }`}
                  >
                    {o.status === "picked_up" ? "PICKED UP" : o.status === "completed" ? "FULLY PAID" : "PAYING"}
                  </span>
                </div>
                <div className="w-full bg-ink-100 rounded-full h-1.5 mt-1.5">
                  <div
                    className="bg-tag h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (o.amountPaid / o.totalPrice) * 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/layaway/new"
        className="md:hidden fixed bottom-20 right-4 bg-tag text-ink-950 rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg"
      >
        +
      </Link>
    </div>
  );
}
