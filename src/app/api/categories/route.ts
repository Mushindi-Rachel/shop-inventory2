import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const cats = await db.select().from(categories).orderBy(categories.name);
  // attach product counts
  const counts = await db
    .select({ categoryId: products.categoryId, count: sql<number>`count(*)` })
    .from(products)
    .groupBy(products.categoryId);
  const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));
  const result = cats.map((c) => ({ ...c, productCount: countMap.get(c.id) || 0 }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || "").trim();
  let prefix = (body.prefix || "").trim().toUpperCase();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!prefix) prefix = name.slice(0, 3).toUpperCase();
  prefix = prefix.replace(/[^A-Z0-9]/g, "").slice(0, 5);
  if (!prefix) return NextResponse.json({ error: "Could not derive a code prefix" }, { status: 400 });

  try {
    const [row] = await db
      .insert(categories)
      .values({ name, prefix, createdAt: new Date().toISOString() })
      .returning();
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: "That name or prefix is already used" }, { status: 400 });
  }
}
