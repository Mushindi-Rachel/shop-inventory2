import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { layawayOrders, layawayPayments, products } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const [order] = await db
    .select({
      id: layawayOrders.id,
      customerName: layawayOrders.customerName,
      customerPhone: layawayOrders.customerPhone,
      productId: layawayOrders.productId,
      productName: products.name,
      productCode: products.code,
      productImage: products.imagePath,
      totalPrice: layawayOrders.totalPrice,
      status: layawayOrders.status,
      createdAt: layawayOrders.createdAt,
    })
    .from(layawayOrders)
    .leftJoin(products, eq(layawayOrders.productId, products.id))
    .where(eq(layawayOrders.id, id));

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payments = await db
    .select()
    .from(layawayPayments)
    .where(eq(layawayPayments.layawayOrderId, id))
    .orderBy(asc(layawayPayments.paidAt));

  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({ ...order, payments, amountPaid, balance: order.totalPrice - amountPaid });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();

  const [order] = await db.select().from(layawayOrders).where(eq(layawayOrders.id, id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updatable: Record<string, any> = {};
  if (body.status) updatable.status = body.status;

  const [row] = await db.update(layawayOrders).set(updatable).where(eq(layawayOrders.id, id)).returning();

  // When picked up, remove the product from inventory entirely (it left the shop).
  if (body.status === "picked_up") {
    await db.update(products).set({ status: "sold_out", quantity: 0 }).where(eq(products.id, order.productId));
  }
  // If an order is cancelled, release the product back to the shelf.
  if (body.status === "cancelled") {
    await db.update(products).set({ status: "active" }).where(eq(products.id, order.productId));
  }

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await db.delete(layawayPayments).where(eq(layawayPayments.layawayOrderId, id));
  await db.delete(layawayOrders).where(eq(layawayOrders.id, id));
  return NextResponse.json({ ok: true });
}
