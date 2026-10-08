import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, pct } from "@/lib/format";
import { Plus, Target, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/savings")({
  component: Savings,
});

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: string;
};

function Savings() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tick, setTick] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [contrib, setContrib] = useState<{ goal: Goal; amt: string } | null>(null);

  // new goal form
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [tgtDate, setTgtDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setGoals((data ?? []) as Goal[]));
  }, [user, tick]);

  async function createGoal() {
    if (!user) return;
    if (!name || !target) return toast.error("Fill all fields");
    const { error } = await supabase
      .from("savings_goals")
      .insert({ user_id: user.id, name, target_amount: Number(target), target_date: tgtDate });
    if (error) return toast.error(error.message);
    toast.success("Goal created 🎯");
    setName("");
    setTarget("");
    setNewOpen(false);
    setTick((t) => t + 1);
  }

  async function contribute() {
    if (!contrib || !user) return;
    const amt = Number(contrib.amt);
    if (!amt || amt <= 0) return toast.error("Enter an amount");
    const newAmt = Number(contrib.goal.current_amount) + amt;
    const reached = newAmt >= Number(contrib.goal.target_amount);
    const { error } = await supabase
      .from("savings_goals")
      .update({
        current_amount: newAmt,
        status: reached ? "complete" : "active",
      })
      .eq("id", contrib.goal.id);
    if (error) return toast.error(error.message);
    toast.success(`Added ${formatNaira(amt)} ✨`);
    if (reached) {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      toast.success(`🎉 Goal reached: ${contrib.goal.name}!`);
    } else {
      // milestone celebrations
      const prevP = pct(Number(contrib.goal.current_amount), Number(contrib.goal.target_amount));
      const nowP = pct(newAmt, Number(contrib.goal.target_amount));
      [25, 50, 75].forEach((m) => {
        if (prevP < m && nowP >= m) confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      });
    }
    setContrib(null);
    setTick((t) => t + 1);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings goals</h1>
          <p className="text-sm text-white/60">Stack it up 💪</p>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-white glow-purple"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {goals.map((g) => {
          const p = Math.min(100, pct(Number(g.current_amount), Number(g.target_amount)));
          const today = new Date();
          const target = new Date(g.target_date);
          const totalDays = Math.max(
            1,
            (target.getTime() - new Date(g.id ? g.target_date : today).getTime()) / 86400000,
          );
          const daysLeft = Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
          const onTrack = p >= 100 - (daysLeft / Math.max(1, totalDays + daysLeft)) * 100;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-3xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-neon-cyan" />
                    <span className="text-base font-bold">{g.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    By{" "}
                    {new Date(g.target_date).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {daysLeft}d left
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${onTrack ? "bg-neon-green/15 text-neon-green" : "bg-neon-amber/15 text-neon-amber"}`}
                >
                  {g.status === "complete" ? "✅ Done" : onTrack ? "On track" : "Behind"}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-black text-gradient">
                  {formatNaira(g.current_amount)}
                </div>
                <div className="text-xs text-white/55">of {formatNaira(g.target_amount)}</div>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-accent"
                />
              </div>
              <div className="mt-1 text-[11px] text-white/60">{p}%</div>
              {g.status !== "complete" && (
                <button
                  onClick={() => setContrib({ goal: g, amt: "" })}
                  className="mt-3 w-full rounded-2xl bg-gradient-accent py-2.5 text-sm font-semibold text-white glow-cyan active:scale-95"
                >
                  Contribute
                </button>
              )}
            </motion.div>
          );
        })}
        {goals.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-white/60">
            No goals yet. Tap <span className="font-semibold text-gradient">New</span> to set your
            first one 🎯
          </div>
        )}
      </div>

      {newOpen && (
        <Modal title="New goal" onClose={() => setNewOpen(false)}>
          <Input label="Name" value={name} onChange={setName} placeholder="New Laptop" />
          <Input
            label="Target amount (₦)"
            value={target}
            onChange={setTarget}
            type="number"
            placeholder="350000"
          />
          <Input label="Target date" value={tgtDate} onChange={setTgtDate} type="date" />
          <button
            onClick={createGoal}
            className="mt-4 w-full rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-95"
          >
            Create goal
          </button>
        </Modal>
      )}

      {contrib && (
        <Modal title={`Contribute to ${contrib.goal.name}`} onClose={() => setContrib(null)}>
          <Input
            label="Amount (₦)"
            value={contrib.amt}
            onChange={(v) => setContrib({ ...contrib, amt: v })}
            type="number"
            placeholder="5000"
          />
          <button
            onClick={contribute}
            className="mt-4 w-full rounded-2xl bg-gradient-accent py-3 font-semibold text-white glow-cyan active:scale-95"
          >
            Add
          </button>
        </Modal>
      )}
    </AppShell>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm rounded-3xl glass-strong p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-neon-purple/70 focus:ring-2 focus:ring-neon-purple/30"
      />
    </label>
  );
}
