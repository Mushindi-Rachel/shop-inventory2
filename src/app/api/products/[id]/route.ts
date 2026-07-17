import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const [row] = await db
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
    .where(eq(products.id, id));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();

  const updatable: Record<string, any> = {};
  for (const key of [
    "categoryId",
    "name",
    "origin",
    "imagePath",
    "costPrice",
    "sellingPrice",
    "quantity",
    "lowStockThreshold",
    "status",
    "notes",
  ]) {
    if (key in body) updatable[key] = body[key];
  }

  const [row] = await db.update(products).set(updatable).where(eq(products.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}
