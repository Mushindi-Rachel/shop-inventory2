import type { Metadata } from "next";
import "./globals.css";
import NavShell from "@/components/NavShell";
import { isAuthed } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Shelf — Shop Inventory",
  description: "Inventory and layaway manager",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthed();

  return (
    <html lang="en">
      <body className="font-body bg-ink-50 min-h-screen">
        {authed ? <NavShell>{children}</NavShell> : children}
      </body>
    </html>
  );
}