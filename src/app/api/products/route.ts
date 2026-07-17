import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { nextProductCode } from "@/lib/codegen";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId");
  const status = searchParams.get("status"); // active | sold_out | all

  const conditions = [];
  if (categoryId) conditions.push(eq(products.categoryId, parseInt(categoryId, 10)));
  if (status && status !== "all") conditions.push(eq(products.status, status));
  if (q) {
    conditions.push(
      or(like(products.name, `%${q}%`), like(products.code, `%${q}%`), like(products.notes, `%${q}%`))
    );
  }

  const rows = await db
    .select({
      id: products.id,
      code: products.code,
      categoryId: products.categoryId,
      categoryName: categories.name,
      name: products.name,
      origin: products.origin,
      imagePath: products.imagePath,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      quantity: products.quantity,
      lowStockThreshold: products.lowStockThreshold,
      status: products.status,
      notes: products.notes,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(products.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { categoryId, name, origin, imagePath, costPrice, sellingPrice, quantity, notes, lowStockThreshold } = body;

  if (!categoryId) return NextResponse.json({ error: "Category is required" }, { status: 400 });

  const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId));
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });

  const code = nextProductCode(cat.prefix);

  const [row] = await db
    .insert(products)
    .values({
      code,
      categoryId,
      name: name || null,
      origin: origin || null,
      imagePath: imagePath || null,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      quantity: Number(quantity) || 1,
      lowStockThreshold: Number(lowStockThreshold) || 1,
      status: "active",
      notes: notes || null,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(row);
}
