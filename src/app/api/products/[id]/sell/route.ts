import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, sales } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  const body = await req.json();
  const qty = Math.max(1, parseInt(body.quantity, 10) || 1);

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  if (qty > product.quantity) {
    return NextResponse.json(
      {
        error: `Only ${product.quantity} in stock — can't sell ${qty}.`,
      },
      { status: 400 }
    );
  }

  const remaining = product.quantity - qty;
  const newStatus = remaining <= 0 ? "sold_out" : product.status;

  await db
    .update(products)
    .set({
      quantity: remaining,
      status: newStatus,
    })
    .where(eq(products.id, productId));

  const [sale] = await db
    .insert(sales)
    .values({
      productId,
      quantitySold: qty,
      unitPrice: product.sellingPrice,
      totalAmount: product.sellingPrice * qty,
      saleDate: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json({
    ok: true,
    sale,
    remaining,
    status: newStatus,
  });
}