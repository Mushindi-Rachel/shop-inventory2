import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  const inUse = await db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId))
    .limit(1);

  if (inUse.length > 0) {
    return NextResponse.json(
      {
        error: "This category still has products in it. Move or remove them first.",
      },
      { status: 400 }
    );
  }

  await db.delete(categories).where(eq(categories.id, categoryId));

  return NextResponse.json({ ok: true });
}