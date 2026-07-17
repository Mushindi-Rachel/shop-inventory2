import { sqlite } from "@/db";

/**
 * Generates the next sequential product code for a category, e.g. APP-0001, APP-0002.
 * Sequence is based on how many products currently exist under that prefix, so it
 * keeps incrementing even after items are marked sold (codes are never reused).
 */
export function nextProductCode(categoryPrefix: string): string {
  const prefix = categoryPrefix.toUpperCase();
  const row = sqlite
    .prepare(
      `SELECT code FROM products WHERE code LIKE ? ORDER BY id DESC LIMIT 1`
    )
    .get(`${prefix}-%`) as { code: string } | undefined;

  let next = 1;
  if (row?.code) {
    const parts = row.code.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}-${String(next).padStart(4, "0")}`;
}
