import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { layawayOrders, layawayPayments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount <= 0) return NextResponse.json({ error: "Enter a valid payment amount" }, { status: 400 });

  const [order] = await db.select().from(layawayOrders).where(eq(layawayOrders.id, id));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await db.insert(layawayPayments).values({
    layawayOrderId: id,
    amount,
    note: body.note || null,
    paidAt: new Date().toISOString(),
  });

  const payments = await db.select().from(layawayPayments).where(eq(layawayPayments.layawayOrderId, id));
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  let newStatus = order.status;
  if (totalPaid >= order.totalPrice && order.status === "pending") {
    newStatus = "completed";
    await db.update(layawayOrders).set({ status: "completed" }).where(eq(layawayOrders.id, id));
  }

  return NextResponse.json({ ok: true, amountPaid: totalPaid, balance: order.totalPrice - totalPaid, status: newStatus });
}
