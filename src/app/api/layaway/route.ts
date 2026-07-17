import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { layawayOrders, layawayPayments, products } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await db
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
    .orderBy(desc(layawayOrders.createdAt));

  const paidTotals = await db
    .select({ layawayOrderId: layawayPayments.layawayOrderId, paid: sql<number>`sum(${layawayPayments.amount})` })
    .from(layawayPayments)
    .groupBy(layawayPayments.layawayOrderId);
  const paidMap = new Map(paidTotals.map((p) => [p.layawayOrderId, p.paid]));

  let result = orders.map((o) => ({
    ...o,
    amountPaid: paidMap.get(o.id) || 0,
    balance: o.totalPrice - (paidMap.get(o.id) || 0),
  }));

  if (status && status !== "all") result = result.filter((o) => o.status === status);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerPhone, productId, totalPrice, initialPayment } = body;

  if (!customerName || !productId || !totalPrice) {
    return NextResponse.json({ error: "Customer name, product, and total price are required" }, { status: 400 });
  }

  const [order] = await db
    .insert(layawayOrders)
    .values({
      customerName,
      customerPhone: customerPhone || null,
      productId,
      totalPrice: Number(totalPrice),
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    .returning();

  // Reserve the product so it doesn't show as available on the shelf
  await db.update(products).set({ status: "reserved" }).where(eq(products.id, productId));

  if (initialPayment && Number(initialPayment) > 0) {
    await db.insert(layawayPayments).values({
      layawayOrderId: order.id,
      amount: Number(initialPayment),
      note: "Initial deposit",
      paidAt: new Date().toISOString(),
    });
  }

  return NextResponse.json(order);
}
