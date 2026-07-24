import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const dataDir = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, "shop.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT,
  origin TEXT,
  image_path TEXT,
  cost_price REAL NOT NULL DEFAULT 0,
  selling_price REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  low_stock_threshold INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity_sold INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_amount REAL NOT NULL,
  sale_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS layaway_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS layaway_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  layaway_order_id INTEGER NOT NULL REFERENCES layaway_orders(id),
  amount REAL NOT NULL,
  note TEXT,
  paid_at TEXT NOT NULL
);
`);

// Seed a few starter categories the first time the shop runs.
const catCount = sqlite.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
if (catCount.c === 0) {
  const insert = sqlite.prepare(
    "INSERT INTO categories (name, prefix, created_at) VALUES (?, ?, ?)"
  );
  const now = new Date().toISOString();
  const starters: [string, string][] = [
    ["Appliances", "APP"],
    ["Kitchenware", "KIT"],
    ["Furniture", "FUR"],
    ["Electronics", "ELE"],
    ["Toys", "TOY"],
    ["Clothing", "CLO"],
    ["Home Decor", "DEC"],
  ];
  for (const [name, prefix] of starters) insert.run(name, prefix, now);
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
