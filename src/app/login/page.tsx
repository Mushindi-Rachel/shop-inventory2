"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      const next = params.get("next") || "/";
      router.push(next);
      router.refresh();
    } else {
      setError("Wrong password. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-display font-bold text-3xl text-white tracking-tight">Shelf</div>
          <div className="text-ink-400 text-sm mt-1">Sign in to manage your shop</div>
        </div>
        <form onSubmit={handleSubmit} className="bg-ink-900 rounded-lg p-6 space-y-4 border border-ink-800">
          <div>
            <label className="text-sm text-ink-300 block mb-1.5">Password</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded bg-ink-800 border border-ink-700 text-white px-3 py-2.5 tap-target focus:outline-none focus:ring-2 focus:ring-tag"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-rust text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tag hover:bg-tag-dark text-ink-950 font-semibold rounded py-2.5 tap-target transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
