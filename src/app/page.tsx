"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { money } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-ink-500">Loading your shop overview…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Good to see you</h1>
        <p className="text-ink-500 text-sm mt-1">Here's how the shop is doing.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue today" value={money(data.salesToday.revenue)} sub={`${data.salesToday.units} items sold`} accent="tag" />
        <StatCard label="Revenue this month" value={money(data.salesThisMonth.revenue)} sub={`${data.salesThisMonth.units} items sold`} />
        <StatCard label="Profit this month" value={money(data.profitThisMonth.profit)} accent="leaf" />
        <StatCard
          label="Layaway owed to you"
          value={money(data.layawayOutstanding.outstandingBalance)}
          sub={`${data.layawayOutstanding.openOrders} open orders`}
          accent="rust"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Items on shelf" value={String(data.inventory.itemCount)} sub={`${data.inventory.unitsInStock} units in stock`} />
        <StatCard label="Stock cost value" value={money(data.inventory.costValue)} />
        <StatCard label="Stock retail value" value={money(data.inventory.retailValue)} />
        <StatCard
          label="Potential profit"
          value={money(data.inventory.retailValue - data.inventory.costValue)}
          accent="leaf"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-lg border border-ink-200 p-4">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Revenue — last 14 days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8a539" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#e8a539" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7a92" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7a92" }} width={40} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#c9861f" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-ink-200 p-4">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Top categories</h2>
          {data.topCategories.length === 0 ? (
            <p className="text-sm text-ink-400">No sales recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topCategories} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 11, fill: "#333e50" }} />
                <Tooltip formatter={(v: number) => money(v)} />
                <Bar dataKey="revenue" fill="#4d7c62" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-ink-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink-900">Low stock</h2>
          <Link href="/products" className="text-xs text-tag-dark font-medium">View shelf →</Link>
        </div>
        {data.lowStock.length === 0 ? (
          <p className="text-sm text-ink-400">Nothing running low right now.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.lowStock.map((item: any) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:bg-ink-50 -mx-2 px-2 rounded"
              >
                <div>
                  <span className="font-mono text-ink-500 mr-2">{item.code}</span>
                  <span className="text-ink-800">{item.name || "Unnamed item"}</span>
                </div>
                <span className="text-rust font-semibold">{item.quantity} left</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
