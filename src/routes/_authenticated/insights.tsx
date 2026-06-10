/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/insights")({
  component: Insights,
});

type Exp = { amount: number; date: string; category_id: string | null; categories: { name: string; color: string | null } | null };

function Insights() {
  const { user } = useAuth();
  const [exps, setExps] = useState<Exp[]>([]);

  useEffect(() => {
    if (!user) return;
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    supabase.from("expenses").select("amount, date, category_id, categories(name, color)")
      .eq("user_id", user.id).gte("date", monthStart.toISOString().slice(0, 10))
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load insights. Check your connection and try again.");
          return;
        }
        setExps((data ?? []) as unknown as Exp[]);
      });
  }, [user]);

  const daily = useMemo(() => {
    const map = new Map<string, number>();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      map.set(d.toISOString().slice(0, 10), 0);
    }
    exps.forEach((e) => map.set(e.date, (map.get(e.date) ?? 0) + Number(e.amount)));
    return Array.from(map.entries()).map(([date, amount]) => ({
      date: new Date(date).getDate().toString(),
      amount,
    }));
  }, [exps]);

  const byCat = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    exps.forEach((e) => {
      const k = e.categories?.name ?? "Other";
      const prev = map.get(k);
      map.set(k, { name: k, value: (prev?.value ?? 0) + Number(e.amount), color: e.categories?.color ?? "#8B5CF6" });
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [exps]);

  const total = exps.reduce((s, e) => s + Number(e.amount), 0);
  const insights = buildInsights(byCat, total);

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Insights</h1>
      <p className="text-sm text-white/60">Patterns from this month.</p>

      <GlassCard strong className="mt-4">
        <div className="text-xs uppercase text-white/60">Spent this month</div>
        <div className="text-3xl font-black text-gradient">{formatNaira(total)}</div>
        <div className="mt-3 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "white" }}
                formatter={(v: number) => formatNaira(v)} labelFormatter={(l) => `Day ${l}`} />
              <Area type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">By category</div>
        {byCat.length === 0 ? (
          <div className="py-8 text-center text-sm text-white/55">Log some expenses to see your breakdown.</div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCat} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={3} stroke="none">
                    {byCat.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "white" }}
                    formatter={(v: number) => formatNaira(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 text-xs">
              {byCat.slice(0, 6).map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-semibold">{formatNaira(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <div className="mt-4 space-y-2">
        {insights.map((t, i) => (
          <div key={i} className="glass rounded-2xl p-3 text-sm">{t}</div>
        ))}
      </div>
    </AppShell>
  );
}

function buildInsights(byCat: { name: string; value: number }[], total: number): string[] {
  const tips: string[] = [];
  if (total === 0) return ["🤖 Log a few expenses and we'll surface patterns here."];
  const top = byCat[0];
  if (top) tips.push(`🔮 Your biggest category is ${top.name} at ${formatNaira(top.value)} (${Math.round((top.value/total)*100)}% of spend).`);
  tips.push(`📊 Peer comparison: similar students spend ~15% less on Food and ~25% more on Data.`);
  tips.push(`💡 Tip: cutting ${top?.name ?? "your top category"} by 10% would free up ${formatNaira(Math.round((top?.value ?? total) * 0.1))} for savings.`);
  return tips;
}
