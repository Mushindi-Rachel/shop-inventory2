export default function StatCard({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "tag" | "leaf" | "rust";
}) {
  const borders: Record<string, string> = {
    default: "border-ink-200",
    tag: "border-tag",
    leaf: "border-leaf",
    rust: "border-rust",
  };
  return (
    <div className={`bg-white rounded-lg border ${borders[accent]} p-4`}>
      <div className="text-xs uppercase tracking-wide text-ink-500 font-medium">{label}</div>
      <div className="font-display text-2xl font-bold text-ink-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}
