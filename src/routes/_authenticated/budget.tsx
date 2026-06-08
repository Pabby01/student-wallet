import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, pct, statusFromPct } from "@/lib/format";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/budget")({
  component: Budget,
});

type Cat = { id: string; name: string; icon: string | null; color: string | null; allocated: number; spent: number; bucket: string | null };

function Budget() {
  const { user } = useAuth();
  const [cats, setCats] = useState<Cat[]>([]);
  const [allowance, setAllowance] = useState(0);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [newAlloc, setNewAlloc] = useState(0);
  const [showAi, setShowAi] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("monthly_allowance").eq("id", user.id).maybeSingle(),
        supabase.from("categories").select("id, name, icon, color, allocated, spent, bucket").eq("user_id", user.id),
      ]);
      setAllowance(Number(p?.monthly_allowance ?? 0));
      setCats((c ?? []) as Cat[]);
    })();
  }, [user, tick]);

  async function saveAlloc() {
    if (!editing) return;
    const { error } = await supabase.from("categories").update({ allocated: newAlloc }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setEditing(null); setTick((t) => t + 1);
  }

  const totalAlloc = cats.reduce((s, c) => s + Number(c.allocated), 0);
  const totalSpent = cats.reduce((s, c) => s + Number(c.spent), 0);

  const aiInsights = buildAiInsights(cats);

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-sm text-white/60">{new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</p>
        </div>
        <button onClick={() => setShowAi(true)} className="inline-flex items-center gap-1 rounded-xl glass border border-neon-purple/40 px-3 py-1.5 text-xs font-semibold glow-purple">
          <Sparkles className="h-3.5 w-3.5 text-neon-amber" /> AI tips
        </button>
      </div>

      <div className="mt-4 glass-strong rounded-3xl p-5">
        <div className="text-xs uppercase text-white/60">Allowance</div>
        <div className="text-3xl font-black text-gradient">{formatNaira(allowance)}</div>
        <div className="mt-1 text-xs text-white/70">{formatNaira(totalSpent)} spent · {formatNaira(Math.max(0, allowance - totalSpent))} left</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct(totalSpent, totalAlloc || allowance))}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-primary" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {cats.map((c) => {
          const p = pct(Number(c.spent), Number(c.allocated));
          const s = statusFromPct(p);
          return (
            <div key={c.id} className="glass rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-[11px] text-white/55">{formatNaira(c.spent)} / {formatNaira(c.allocated)}</div>
                  </div>
                </div>
                <button onClick={() => { setEditing(c); setNewAlloc(Number(c.allocated)); }}
                  className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/10">Edit</button>
              </div>
              <div className={`mt-2 h-2 overflow-hidden rounded-full bg-white/10 ${p >= 90 ? "ring-1 ring-neon-red/40" : ""}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, p)}%` }} transition={{ duration: 0.6 }} className="h-full" style={{ backgroundColor: s.color }} />
              </div>
              <div className="mt-1 text-[11px] font-semibold" style={{ color: s.color }}>{p}% used</div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title={`Reallocate ${editing.name}`}>
          <div className="text-center text-3xl font-black text-gradient">{formatNaira(newAlloc)}</div>
          <input type="range" min={0} max={Math.max(200000, allowance)} step={500} value={newAlloc} onChange={(e) => setNewAlloc(Number(e.target.value))} className="mt-4 w-full accent-[#8B5CF6]" />
          <button onClick={saveAlloc} className="mt-4 w-full rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-95">Save</button>
        </Modal>
      )}

      {showAi && (
        <Modal onClose={() => setShowAi(false)} title="🤖 AI Recommendations">
          <div className="space-y-3">
            {aiInsights.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-3 text-sm">{t}</div>
            ))}
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

function buildAiInsights(cats: Cat[]): string[] {
  const tips: string[] = [];
  cats.forEach((c) => {
    const p = pct(Number(c.spent), Number(c.allocated));
    if (p >= 90) tips.push(`⚠️ You're at ${p}% of your ${c.name} budget. Consider trimming by ${formatNaira(Math.round(Number(c.allocated) * 0.15))} next month.`);
    else if (p < 40 && Number(c.allocated) > 0) tips.push(`💡 You're under-spending on ${c.name} (${p}%). Move some to Savings?`);
  });
  if (!tips.length) tips.push("🎉 Your budget is balanced. Keep it up!");
  tips.push("📊 Similar students spend ~20% less on Data. Try a cheaper plan?");
  return tips;
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 w-full max-w-sm rounded-3xl glass-strong p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
