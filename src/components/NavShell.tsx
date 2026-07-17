"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/products", label: "Shelf", icon: "box" },
  { href: "/products/new", label: "Add Item", icon: "plus" },
  { href: "/layaway", label: "Layaway", icon: "tag" },
  { href: "/categories", label: "Categories", icon: "folder" },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const common = { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8 };
  switch (name) {
    case "grid":
      return (
        <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
      );
    case "box":
      return (
        <svg {...common}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>
      );
    case "plus":
      return (
        <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
      );
    case "tag":
      return (
        <svg {...common}><path d="M20.5 12.5L12 21l-9-9L11.5 3H20.5z" /><circle cx="16.5" cy="7.5" r="1.2" /></svg>
      );
    case "folder":
      return (
        <svg {...common}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
      );
    case "logout":
      return (
        <svg {...common}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
      );
    default:
      return null;
  }
}

export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="md:flex min-h-screen">
      {/* Sidebar - tablet landscape / desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col bg-ink-900 text-ink-100 shrink-0 print:hidden">
        <div className="px-6 py-6 border-b border-ink-800">
          <div className="font-display font-bold text-xl tracking-tight text-white">Shelf</div>
          <div className="text-xs text-ink-400 mt-0.5">Inventory & Layaway</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                  active ? "bg-tag text-ink-950 font-semibold" : "hover:bg-ink-800 text-ink-200"
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-6 py-4 border-t border-ink-800 text-ink-300 hover:text-white text-sm"
        >
          <Icon name="logout" className="w-4 h-4" />
          Log out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8">{children}</div>
      </main>

      {/* Bottom bar - phones / tablet portrait */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-900 border-t border-ink-800 flex justify-around items-center py-2 z-40 print:hidden">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded tap-target ${
                active ? "text-tag" : "text-ink-400"
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
