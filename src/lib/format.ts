export const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatNaira = (n: number | null | undefined) =>
  NGN.format(Number(n ?? 0));

export const formatNumber = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Number(n ?? 0));

export function pct(spent: number, allocated: number) {
  if (!allocated || allocated <= 0) return 0;
  return Math.round((spent / allocated) * 100);
}

export function statusFromPct(p: number) {
  if (p >= 100) return { tone: "danger", color: "#EF4444" } as const;
  if (p >= 90) return { tone: "danger", color: "#EF4444" } as const;
  if (p >= 75) return { tone: "warn", color: "#F59E0B" } as const;
  return { tone: "ok", color: "#10B981" } as const;
}
