import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  createdAt: text("created_at").notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  categoryId: integer("category_id").notNull(),
  name: text("name"),
  origin: text("origin"),
  imagePath: text("image_path"),
  costPrice: real("cost_price").notNull().default(0),
  sellingPrice: real("selling_price").notNull().default(0),
  quantity: integer("quantity").notNull().default(1),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(1),
  status: text("status").notNull().default("active"), // active | sold_out | reserved
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  quantitySold: integer("quantity_sold").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalAmount: real("total_amount").notNull(),
  saleDate: text("sale_date").notNull(),
});

export const layawayOrders = sqliteTable("layaway_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  productId: integer("product_id").notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status").notNull().default("pending"), // pending | completed | picked_up
  createdAt: text("created_at").notNull(),
});

export const layawayPayments = sqliteTable("layaway_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  layawayOrderId: integer("layaway_order_id").notNull(),
  amount: real("amount").notNull(),
  note: text("note"),
  paidAt: text("paid_at").notNull(),
});
