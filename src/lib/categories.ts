// Default Nigerian-student budget categories using the 60/20/20 rule.
export type DefaultCategory = {
  name: string;
  icon: string; // emoji for simplicity & vibrancy
  color: string;
  bucket: "needs" | "wants" | "savings";
  /** percent of monthly allowance */
  defaultPct: number;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Food", icon: "🍲", color: "#EC4899", bucket: "needs", defaultPct: 35 },
  { name: "Transport", icon: "🚌", color: "#06B6D4", bucket: "needs", defaultPct: 10 },
  { name: "Academic Materials", icon: "📚", color: "#8B5CF6", bucket: "needs", defaultPct: 5 },
  { name: "Data/Airtime", icon: "📱", color: "#10B981", bucket: "needs", defaultPct: 5 },
  { name: "Other Needs", icon: "🧴", color: "#F59E0B", bucket: "needs", defaultPct: 5 },
  { name: "Entertainment", icon: "🎮", color: "#EC4899", bucket: "wants", defaultPct: 8 },
  { name: "Eating Out", icon: "🍔", color: "#F59E0B", bucket: "wants", defaultPct: 7 },
  { name: "Shopping", icon: "🛍️", color: "#06B6D4", bucket: "wants", defaultPct: 5 },
  { name: "Savings", icon: "💰", color: "#10B981", bucket: "savings", defaultPct: 20 },
];

export const BUCKET_META: Record<
  DefaultCategory["bucket"],
  { label: string; color: string; pct: number }
> = {
  needs: { label: "Needs", color: "#06B6D4", pct: 60 },
  wants: { label: "Wants", color: "#EC4899", pct: 20 },
  savings: { label: "Savings", color: "#10B981", pct: 20 },
};
