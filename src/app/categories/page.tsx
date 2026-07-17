"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prefix }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      setPrefix("");
      load();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Categories</h1>
        <p className="text-ink-500 text-sm mt-1">Each category has a short prefix used to generate item codes, like APP-0001.</p>
      </div>

      <form onSubmit={addCategory} className="bg-white border border-ink-200 rounded-lg p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-sm text-ink-600 block mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-ink-200 px-3 py-2 tap-target" placeholder="e.g. Bedding" />
        </div>
        <div className="w-28">
          <label className="text-sm text-ink-600 block mb-1">Code prefix</label>
          <input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
            className="w-full rounded border border-ink-200 px-3 py-2 tap-target font-mono"
            placeholder="auto"
            maxLength={5}
          />
        </div>
        <button type="submit" disabled={saving} className="bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded px-4 py-2.5 tap-target">
          {saving ? "Adding…" : "Add category"}
        </button>
      </form>
      {error && <p className="text-rust text-sm -mt-3">{error}</p>}

      <div className="bg-white border border-ink-200 rounded-lg divide-y divide-ink-100">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium text-ink-900">{c.name}</span>
              <span className="ml-2 font-mono text-xs text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded">{c.prefix}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-400">{c.productCount} item{c.productCount === 1 ? "" : "s"}</span>
              <button onClick={() => remove(c.id)} className="text-rust text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
