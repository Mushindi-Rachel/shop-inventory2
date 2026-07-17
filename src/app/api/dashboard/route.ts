import { NextResponse } from "next/server";
import { sqlite } from "@/db";

export async function GET() {
  const inventory = sqlite
    .prepare(
      `SELECT
        COUNT(*) as itemCount,
        COALESCE(SUM(quantity),0) as unitsInStock,
        COALESCE(SUM(cost_price*quantity),0) as costValue,
        COALESCE(SUM(selling_price*quantity),0) as retailValue
      FROM products WHERE status != 'sold_out'`
    )
    .get() as any;

  const lowStock = sqlite
    .prepare(
      `SELECT id, code, name, quantity, low_stock_threshold as threshold
       FROM products WHERE status = 'active' AND quantity <= low_stock_threshold
       ORDER BY quantity ASC LIMIT 10`
    )
    .all();

  const salesToday = sqlite
    .prepare(
      `SELECT COALESCE(SUM(total_amount),0) as revenue, COALESCE(SUM(quantity_sold),0) as units
       FROM sales WHERE date(sale_date) = date('now')`
    )
    .get() as any;

  const salesThisMonth = sqlite
    .prepare(
      `SELECT COALESCE(SUM(total_amount),0) as revenue, COALESCE(SUM(quantity_sold),0) as units
       FROM sales WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now')`
    )
    .get() as any;

  const profitThisMonth = sqlite
    .prepare(
      `SELECT COALESCE(SUM((s.unit_price - p.cost_price) * s.quantity_sold),0) as profit
       FROM sales s JOIN products p ON p.id = s.product_id
       WHERE strftime('%Y-%m', s.sale_date) = strftime('%Y-%m', 'now')`
    )
    .get() as any;

  const last14Days = sqlite
    .prepare(
      `SELECT date(sale_date) as day, COALESCE(SUM(total_amount),0) as revenue
       FROM sales
       WHERE sale_date >= datetime('now','-13 days')
       GROUP BY date(sale_date)
       ORDER BY day ASC`
    )
    .all() as { day: string; revenue: number }[];

  // Fill in missing days with 0 for a clean chart
  const dayMap = new Map(last14Days.map((d) => [d.day, d.revenue]));
  const chartData: { day: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    chartData.push({ day: key.slice(5), revenue: dayMap.get(key) || 0 });
  }

  const topCategories = sqlite
    .prepare(
      `SELECT c.name as category, COALESCE(SUM(s.total_amount),0) as revenue
       FROM sales s
       JOIN products p ON p.id = s.product_id
       JOIN categories c ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY revenue DESC LIMIT 6`
    )
    .all();

  const layawayOutstanding = sqlite
    .prepare(
      `SELECT
        COUNT(*) as openOrders,
        COALESCE(SUM(lo.total_price),0) as totalValue,
        COALESCE((SELECT SUM(amount) FROM layaway_payments lp
                  JOIN layaway_orders lo2 ON lo2.id = lp.layaway_order_id
                  WHERE lo2.status = 'pending'),0) as totalPaid
       FROM layaway_orders lo WHERE lo.status = 'pending'`
    )
    .get() as any;

  return NextResponse.json({
    inventory,
    lowStock,
    salesToday,
    salesThisMonth,
    profitThisMonth,
    chartData,
    topCategories,
    layawayOutstanding: {
      openOrders: layawayOutstanding.openOrders,
      outstandingBalance: layawayOutstanding.totalValue - layawayOutstanding.totalPaid,
    },
  });
}
