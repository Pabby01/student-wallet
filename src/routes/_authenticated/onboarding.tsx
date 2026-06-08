import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CATEGORIES, BUCKET_META } from "@/lib/categories";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [allowance, setAllowance] = useState(40000);
  const [pcts, setPcts] = useState<number[]>(DEFAULT_CATEGORIES.map((c) => c.defaultPct));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("monthly_allowance, onboarded").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.monthly_allowance) setAllowance(Number(data.monthly_allowance));
      if (data?.onboarded) navigate({ to: "/home", replace: true });
    });
  }, [user, navigate]);

  const totals = useMemo(() => {
    const sum = pcts.reduce((a, b) => a + b, 0);
    const buckets = { needs: 0, wants: 0, savings: 0 };
    DEFAULT_CATEGORIES.forEach((c, i) => { buckets[c.bucket] += pcts[i]; });
    return { sum, buckets };
  }, [pcts]);

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      const rows = DEFAULT_CATEGORIES.map((c, i) => ({
        user_id: user.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        bucket: c.bucket,
        is_default: true,
        allocated: Math.round((pcts[i] / 100) * allowance),
        spent: 0,
      }));
      const { error: catErr } = await supabase.from("categories").insert(rows);
      if (catErr) throw catErr;

      const month = new Date().toISOString().slice(0, 8) + "01";
      await supabase.from("budgets").insert({ user_id: user.id, month, total_amount: allowance });

      await supabase
        .from("profiles")
        .update({ monthly_allowance: allowance, onboarded: true })
        .eq("id", user.id);

      toast.success("Budget ready! 🎉");
      navigate({ to: "/home" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen px-4 py-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/40 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-neon-cyan/30 blur-3xl animate-float-slow" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-white/60">Step {step + 1} of 3</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= step ? "bg-gradient-primary" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-strong rounded-3xl p-6">
              <Sparkles className="h-6 w-6 text-neon-amber" />
              <h2 className="mt-3 text-2xl font-bold">Your monthly allowance</h2>
              <p className="mt-1 text-sm text-white/60">We'll split it smartly using the 60/20/20 rule.</p>
              <div className="mt-6">
                <div className="text-center text-4xl font-black text-gradient">{formatNaira(allowance)}</div>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={1000}
                  value={allowance}
                  onChange={(e) => setAllowance(Number(e.target.value))}
                  className="mt-4 w-full accent-[#8B5CF6]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-white/50"><span>₦5k</span><span>₦200k</span></div>
              </div>
              <button onClick={() => setStep(1)} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-95">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-strong rounded-3xl p-6">
                <h2 className="text-2xl font-bold">Split your budget</h2>
                <p className="mt-1 text-sm text-white/60">Adjust percentages for each category.</p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {(Object.keys(BUCKET_META) as Array<keyof typeof BUCKET_META>).map((k) => (
                    <div key={k} className="glass rounded-2xl p-3 text-center">
                      <div className="text-[11px] uppercase text-white/60">{BUCKET_META[k].label}</div>
                      <div className="mt-1 text-lg font-bold" style={{ color: BUCKET_META[k].color }}>{totals.buckets[k]}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {DEFAULT_CATEGORIES.map((c, i) => (
                    <div key={c.name} className="glass rounded-2xl p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><span>{c.icon}</span><span className="font-medium">{c.name}</span></div>
                        <div className="font-semibold" style={{ color: c.color }}>{pcts[i]}% · {formatNaira(Math.round((pcts[i]/100)*allowance))}</div>
                      </div>
                      <input type="range" min={0} max={60} value={pcts[i]} onChange={(e) => {
                        const next = [...pcts]; next[i] = Number(e.target.value); setPcts(next);
                      }} className="mt-2 w-full accent-[#8B5CF6]" />
                    </div>
                  ))}
                </div>

                <div className={`mt-4 rounded-2xl p-3 text-center text-xs font-semibold ${totals.sum === 100 ? "bg-neon-green/15 text-neon-green" : "bg-neon-amber/15 text-neon-amber"}`}>
                  Total: {totals.sum}% {totals.sum !== 100 && "(should be 100%)"}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 rounded-2xl glass py-3 font-semibold active:scale-95">Back</button>
                <button disabled={totals.sum !== 100} onClick={() => setStep(2)} className="flex-1 rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-95 disabled:opacity-50">
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-strong rounded-3xl p-6 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-primary glow-purple">
                <Check className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="mt-5 text-2xl font-bold">You're all set!</h2>
              <p className="mt-1 text-sm text-white/60">
                {formatNaira(allowance)} split across {DEFAULT_CATEGORIES.length} categories.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-left text-xs">
                {DEFAULT_CATEGORIES.slice(0, 6).map((c, i) => (
                  <div key={c.name} className="glass rounded-xl p-2">
                    <div>{c.icon} {c.name}</div>
                    <div className="mt-0.5 font-semibold" style={{ color: c.color }}>{formatNaira(Math.round((pcts[i]/100)*allowance))}</div>
                  </div>
                ))}
              </div>
              <button disabled={saving} onClick={finish} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-95 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Start tracking
              </button>
              <button onClick={() => setStep(1)} className="mt-2 w-full text-xs text-white/60 hover:text-white">Back to edit</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
