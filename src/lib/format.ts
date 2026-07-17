export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "KSh";

export function money(amount: number): string {
  const n = Number(amount) || 0;
  return `${CURRENCY} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
