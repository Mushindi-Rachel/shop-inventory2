"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("Germany");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [lowStockThreshold, setLowStockThreshold] = useState("1");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((cats) => {
      setCategories(cats);
      if (cats.length) setCategoryId(String(cats[0].id));
    });
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!categoryId) return setError("Choose a category");
    setSaving(true);

    let imagePath: string | null = null;
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        setSaving(false);
        return setError("Image upload failed");
      }
      const uploadData = await uploadRes.json();
      imagePath = uploadData.path;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: parseInt(categoryId, 10),
        name: name || null,
        origin,
        imagePath,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        quantity: parseInt(quantity, 10) || 1,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 1,
        notes,
      }),
    });

    setSaving(false);
    if (res.ok) {
      const product = await res.json();
      router.push(`/products/${product.id}?created=1`);
    } else {
      const data = await res.json();
      setError(data.error || "Could not save item");
    }
  }

  const inputClass = "w-full rounded border border-ink-200 bg-white px-3 py-2.5 tap-target focus:outline-none focus:ring-2 focus:ring-tag";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-5">Add an item</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink-200 rounded-lg p-5">
        <div>
          <label className="text-sm text-ink-600 block mb-1.5">Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-ink-100 rounded flex items-center justify-center overflow-hidden shrink-0">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-ink-300 text-xs">No photo</span>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" onChange={onFile} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.prefix})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Origin</label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass}>
              <option value="Germany">Germany</option>
              <option value="UK">UK</option>
              <option value="Local">Local</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-ink-600 block mb-1.5">
            Name <span className="text-ink-400">(optional — e.g. for appliances: "Bosch Kettle 1.7L")</span>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Leave blank if items in this category don't need names" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Cost price (what you paid)</label>
            <input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Selling price</label>
            <input type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Quantity</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-ink-600 block mb-1.5">Low stock alert at</label>
            <input type="number" min={0} value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-sm text-ink-600 block mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} placeholder="Condition, defects, anything worth remembering" />
        </div>

        {error && <p className="text-rust text-sm">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded px-5 py-2.5 tap-target disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save item & generate code"}
          </button>
        </div>
      </form>
    </div>
  );
}
