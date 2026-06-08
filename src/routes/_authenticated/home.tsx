import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, pct, statusFromPct } from "@/lib/format";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { Plus, Sparkles, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  component: Home,
});

type Cat = { id: string; name: string; icon: string | null; color: string | null; allocated: number; spent: number };
type Exp = { id: string; amount: number; merchant: string | null; date: string; categories: { name: string; icon: string | null; color: string | null } | null };

function Home() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [allowance, setAllowance] = useState(0);
  const [cats, setCats] = useState<Cat[]>([]);
  const [recent, setRecent] = useState<Exp[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [activeGoal, setActiveGoal] = useState<{ name: string; current_amount: number; target_amount: number } | null>(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: c }, { data: e }, { data: a }, { data: g }] = await Promise.all([
        supabase.from("profiles").select("full_name, monthly_allowance").eq("id", user.id).maybeSingle(),
        supabase.from("categories").select("id, name, icon, color, allocated, spent").eq("user_id", user.id).order("allocated", { ascending: false }),
        supabase.from("expenses").select("id, amount, merchant, date, categories(name, icon, color)").eq("user_id", user.id).order("date", { ascending: false }).order("created_at", { ascending: false }).limit(5),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("was_read", false),
        supabase.from("savings_goals").select("name, current_amount, target_amount").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1),
      ]);
      setName(profile?.full_name?.split(" ")[0] ?? "friend");
      setAllowance(Number(profile?.monthly_allowance ?? 0));
      setCats((c ?? []) as Cat[]);
      setRecent((e ?? []) as unknown as Exp[]);
      setAlertCount(a as unknown as number ?? 0);
      setActiveGoal(g?.[0] ?? null);
    })();
  }, [user, tick]);

  const totalSpent = cats.reduce((s, c) => s + Number(c.spent), 0);
  const totalAllocated = cats.reduce((s, c) => s + Number(c.allocated), 0) || allowance;
  const remaining = Math.max(0, allowance - totalSpent);
  const ringPct = Math.min(100, pct(totalSpent, totalAllocated));

  return (
    <AppShell>
      <div className="mt-2">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">
          Welcome back, <span className="text-gradient">{name}</span> 👋
        </motion.h1>
        <p className="text-sm text-white/60">{new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {alertCount > 0 && (
        <Link to="/alerts">
          <GlassCard className="mt-4 flex items-center justify-between border-neon-amber/40 bg-neon-amber/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-neon-amber" />
              <div>
                <div className="text-sm font-semibold">You have {alertCount} new alert{alertCount > 1 ? "s" : ""}</div>
                <div className="text-xs text-white/60">Tap to review</div>
              </div>
            </div>
            <span className="text-neon-amber">→</span>
          </GlassCard>
        </Link>
      )}

      {/* Total budget ring */}
      <GlassCard strong className="mt-4">
        <div className="flex items-center gap-5">
          <Ring percent={ringPct} />
          <div className="flex-1">
            <div className="text-xs uppercase text-white/60">This month</div>
            <div className="text-2xl font-black">{formatNaira(totalSpent)}</div>
            <div className="text-xs text-white/60">of {formatNaira(allowance)} spent</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-neon-green/15 px-2 py-0.5 text-xs font-semibold text-neon-green">
              {formatNaira(remaining)} left
            </div>
          </div>
        </div>
      </GlassCard>

      {activeGoal && (
        <Link to="/savings">
          <GlassCard className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold">🎯 {activeGoal.name}</div>
              <div className="text-white/70">{formatNaira(activeGoal.current_amount)} / {formatNaira(activeGoal.target_amount)}</div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct(Number(activeGoal.current_amount), Number(activeGoal.target_amount)))}%` }}
                transition={{ duration: 0.8 }} className="h-full bg-gradient-accent" />
            </div>
          </GlassCard>
        </Link>
      )}

      <div className="mt-5 mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Top categories</h2>
        <Link to="/budget" className="text-xs text-neon-cyan">View all →</Link>
      </div>
      <div className="space-y-2">
        {cats.slice(0, 5).map((c, i) => {
          const p = pct(Number(c.spent), Number(c.allocated));
          const s = statusFromPct(p);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-2xl p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.icon}</span>
                  <span className="font-medium">{c.name}</span>
                </div>
                <div className="text-xs text-white/70">{formatNaira(c.spent)} / {formatNaira(c.allocated)}</div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, p)}%` }} transition={{ duration: 0.6 }} className="h-full" style={{ backgroundColor: s.color }} />
              </div>
              <div className="mt-1 text-[11px] font-semibold" style={{ color: s.color }}>{p}% used</div>
            </motion.div>
          );
        })}
        {cats.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-white/60">No categories yet.</div>
        )}
      </div>

      <div className="mt-5 mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Recent expenses</h2>
        <Link to="/expenses" className="text-xs text-neon-cyan">All →</Link>
      </div>
      <div className="space-y-2">
        {recent.map((e) => (
          <div key={e.id} className="glass flex items-center justify-between rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lg">{e.categories?.icon ?? "💸"}</div>
              <div>
                <div className="text-sm font-medium">{e.merchant || e.categories?.name || "Expense"}</div>
                <div className="text-[11px] text-white/55">{new Date(e.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} · {e.categories?.name}</div>
              </div>
            </div>
            <div className="text-sm font-bold">{formatNaira(e.amount)}</div>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-white/60">
            No expenses yet. Tap <Sparkles className="inline h-3 w-3 text-neon-amber" /> the + button to log your first ✨
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpenSheet(true)}
        className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white glow-purple"
        aria-label="Add expense"
      >
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}>
          <Plus className="h-6 w-6" />
        </motion.div>
      </motion.button>

      <AddExpenseSheet open={openSheet} onClose={() => setOpenSheet(false)} onSaved={() => setTick((t) => t + 1)} />
    </AppShell>
  );
}

function Ring({ percent }: { percent: number }) {
  const size = 96, stroke = 10, r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = percent >= 90 ? "#EF4444" : percent >= 75 ? "#F59E0B" : "#10B981";
  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xl font-black">{percent}%</div>
          <div className="text-[9px] uppercase text-white/55">used</div>
        </div>
      </div>
    </div>
  );
}
