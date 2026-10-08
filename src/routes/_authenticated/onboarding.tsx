import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CATEGORIES, BUCKET_META, type DefaultCategory } from "@/lib/categories";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  ShieldAlert,
  Target,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

type OnboardingCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bucket: DefaultCategory["bucket"];
  pct: number;
  enabled: boolean;
};

const PRESET_STRATEGIES = [
  {
    id: "balanced",
    label: "60 / 20 / 20 Balanced",
    desc: "The classic student formula: 60% needs, 20% wants, 20% savings",
    icon: "⚖️",
    allocations: {
      Food: 35,
      Transport: 10,
      "Academic Materials": 5,
      "Data/Airtime": 5,
      "Other Needs": 5,
      Entertainment: 8,
      "Eating Out": 7,
      Shopping: 5,
      Savings: 20,
    } as Record<string, number>,
  },
  {
    id: "saver",
    label: "High Saver (35% Savings)",
    desc: "Cut extra wants and save aggressively for a laptop, trip, or rainy day",
    icon: "🎯",
    allocations: {
      Food: 30,
      Transport: 10,
      "Academic Materials": 5,
      "Data/Airtime": 5,
      "Other Needs": 5,
      Entertainment: 5,
      "Eating Out": 5,
      Shopping: 0,
      Savings: 35,
    } as Record<string, number>,
  },
  {
    id: "lifestyle",
    label: "Social Campus (15% Savings)",
    desc: "More room for campus hangouts, food runs, and projects",
    icon: "🎉",
    allocations: {
      Food: 35,
      Transport: 12,
      "Academic Materials": 6,
      "Data/Airtime": 7,
      "Other Needs": 5,
      Entertainment: 10,
      "Eating Out": 10,
      Shopping: 5,
      Savings: 10,
    } as Record<string, number>,
  },
];

const ALLOWANCE_CHIPS = [30000, 50000, 80000, 150000, 300000];
const STUDY_YEARS = [
  { val: 1, label: "100L" },
  { val: 2, label: "200L" },
  { val: 3, label: "300L" },
  { val: 4, label: "400L" },
  { val: 5, label: "500L" },
];

function buildInitialCategories(): OnboardingCategory[] {
  return DEFAULT_CATEGORIES.map((c, i) => ({
    id: `cat-${i}`,
    name: c.name,
    icon: c.icon,
    color: c.color,
    bucket: c.bucket,
    pct: c.defaultPct,
    enabled: true,
  }));
}

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [allowance, setAllowance] = useState<number>(40000);
  const [allowanceInput, setAllowanceInput] = useState<string>("40000");
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null);
  const [department, setDepartment] = useState("");
  const [categories, setCategories] = useState<OnboardingCategory[]>(buildInitialCategories());
  const [activeStrategy, setActiveStrategy] = useState("balanced");

  // Optional savings goal
  const [setGoal, setSetGoal] = useState(true);
  const [goalName, setGoalName] = useState("Rainy Day / Emergency Fund");
  const [goalAmount, setGoalAmount] = useState(25000);

  // Custom category modal state
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [newCatBucket, setNewCatBucket] = useState<DefaultCategory["bucket"]>("wants");
  const [showAddCat, setShowAddCat] = useState(false);

  const [saving, setSaving] = useState(false);

  // Sync profile allowance if present
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("monthly_allowance, onboarded, full_name, department, year_of_study")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.onboarded) {
          navigate({ to: "/home", replace: true });
          return;
        }
        if (data?.monthly_allowance && Number(data.monthly_allowance) > 0) {
          const amt = Number(data.monthly_allowance);
          setAllowance(amt);
          setAllowanceInput(String(amt));
        }
        if (data?.department) setDepartment(data.department);
        if (data?.year_of_study) setYearOfStudy(data.year_of_study);
      });
  }, [user, navigate]);

  // Derived totals
  const totals = useMemo(() => {
    const enabledCats = categories.filter((c) => c.enabled);
    const sum = enabledCats.reduce((acc, c) => acc + c.pct, 0);
    const buckets = { needs: 0, wants: 0, savings: 0 };
    enabledCats.forEach((c) => {
      buckets[c.bucket] += c.pct;
    });
    return { sum, buckets, enabledCount: enabledCats.length };
  }, [categories]);

  // Daily budget hint
  const dailyAllowance = useMemo(() => {
    return Math.round(allowance / 30);
  }, [allowance]);

  function handleAllowanceChange(raw: string) {
    const clean = raw.replace(/[^\d]/g, "");
    setAllowanceInput(clean);
    const num = Number(clean) || 0;
    setAllowance(num);
  }

  function applyPreset(presetId: string) {
    const preset = PRESET_STRATEGIES.find((p) => p.id === presetId);
    if (!preset) return;
    setActiveStrategy(presetId);
    setCategories((prev) =>
      prev.map((c) => {
        const targetPct = preset.allocations[c.name];
        if (targetPct !== undefined) {
          return { ...c, pct: targetPct, enabled: targetPct > 0 };
        }
        return c;
      }),
    );
    toast.success(`Applied ${preset.label}`);
  }

  function autoBalance() {
    const enabled = categories.filter((c) => c.enabled);
    if (enabled.length === 0) return;
    const currentSum = enabled.reduce((acc, c) => acc + c.pct, 0) || 1;

    let lastEnabledIdx = -1;
    for (let i = categories.length - 1; i >= 0; i--) {
      if (categories[i].enabled) {
        lastEnabledIdx = i;
        break;
      }
    }

    let remaining = 100;
    const next = categories.map((c, idx) => {
      if (!c.enabled) return { ...c, pct: 0 };
      const isLast = idx === lastEnabledIdx;
      if (isLast) {
        return { ...c, pct: Math.max(1, remaining) };
      }
      const scaled = Math.max(1, Math.round((c.pct / currentSum) * 100));
      remaining -= scaled;
      return { ...c, pct: scaled };
    });

    setCategories(next);
    toast.success("Auto-balanced to exactly 100% ✨");
  }

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const willEnable = !c.enabled;
        return {
          ...c,
          enabled: willEnable,
          pct: willEnable ? (c.pct > 0 ? c.pct : 5) : 0,
        };
      }),
    );
  }

  function handleAddCustomCategory() {
    if (!newCatName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    const newCat: OnboardingCategory = {
      id: `custom-${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon || "🏷️",
      color: BUCKET_META[newCatBucket].color,
      bucket: newCatBucket,
      pct: 5,
      enabled: true,
    };
    setCategories((prev) => [...prev, newCat]);
    setShowAddCat(false);
    setNewCatName("");
    toast.success(`Added ${newCat.name}! Tap 'Auto-balance' to redistribute 100%`);
  }

  function removeCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function finishOnboarding() {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Insert selected categories
      const enabledCats = categories.filter((c) => c.enabled && c.pct > 0);
      const rows = enabledCats.map((c) => ({
        user_id: user.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        bucket: c.bucket,
        is_default: c.id.startsWith("cat-"),
        allocated: Math.round((c.pct / 100) * allowance),
        spent: 0,
      }));

      const { error: catErr } = await supabase.from("categories").insert(rows);
      if (catErr) throw catErr;

      // 2. Insert budget record
      const month = new Date().toISOString().slice(0, 8) + "01";
      await supabase.from("budgets").insert({ user_id: user.id, month, total_amount: allowance });

      // 3. Optional savings goal
      if (setGoal && goalName.trim() && goalAmount > 0) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 3);
        await supabase.from("savings_goals").insert({
          user_id: user.id,
          name: goalName.trim(),
          target_amount: goalAmount,
          current_amount: 0,
          target_date: targetDate.toISOString().slice(0, 10),
          status: "active",
        });
      }

      // 4. Update profile
      await supabase
        .from("profiles")
        .update({
          monthly_allowance: allowance,
          year_of_study: yearOfStudy,
          department: department.trim() || null,
          onboarded: true,
        })
        .eq("id", user.id);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // safe confetti fallback
      }

      toast.success("Welcome aboard! Your smart budget is live 🚀");
      navigate({ to: "/home" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen px-4 py-8 text-foreground selection:bg-neon-purple/30">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/35 blur-3xl animate-float-slow" />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-neon-cyan/25 blur-3xl animate-float-slow"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="mx-auto max-w-xl">
        {/* Step indicator header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan">
              Onboarding
            </span>
            <span className="text-xs text-white/40">·</span>
            <span className="text-xs font-medium text-white/60">Step {step + 1} of 3</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-8 bg-gradient-primary glow-purple"
                    : i < step
                      ? "w-4 bg-neon-green/80"
                      : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Monthly Allowance & Campus Info */}
          {step === 0 && (
            <motion.div
              key="step-allowance"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="glass-strong rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-white glow-purple">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Monthly Allowance</h1>
                  <p className="text-xs text-white/60">How much cash do you manage each month?</p>
                </div>
              </div>

              {/* Direct interactive input */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Enter Monthly Amount (₦)
                </label>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span className="text-3xl font-extrabold text-neon-purple sm:text-4xl">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={allowanceInput}
                    onChange={(e) => handleAllowanceChange(e.target.value)}
                    placeholder="50000"
                    className="w-52 bg-transparent text-center text-4xl font-black text-white outline-none sm:text-5xl"
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/60">
                  <Zap className="h-3.5 w-3.5 text-neon-amber" />
                  <span>That gives you about</span>
                  <span className="font-bold text-white">{formatNaira(dailyAllowance)} / day</span>
                  <span>for campus expenses</span>
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="mt-4">
                <div className="text-xs font-medium text-white/60">Popular student amounts:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALLOWANCE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setAllowance(chip);
                        setAllowanceInput(String(chip));
                      }}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        allowance === chip
                          ? "bg-gradient-primary text-white glow-purple scale-105"
                          : "glass text-white/80 hover:bg-white/15"
                      }`}
                    >
                      {formatNaira(chip)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Campus profile */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Campus Level (Optional)
                </div>
                <div className="mt-2 flex gap-2">
                  {STUDY_YEARS.map((y) => (
                    <button
                      key={y.val}
                      type="button"
                      onClick={() => setYearOfStudy(yearOfStudy === y.val ? null : y.val)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                        yearOfStudy === y.val
                          ? "bg-gradient-primary text-white glow-purple"
                          : "glass text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {y.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Faculty / Department (e.g. Computer Science, UNILAG)"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-neon-purple"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={allowance <= 0}
                  onClick={() => setStep(1)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 font-bold text-white glow-purple active:scale-98 disabled:opacity-50"
                >
                  Configure Budget Split <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="w-full py-2 text-center text-xs text-white/50 transition-colors hover:text-white"
                >
                  Skip customization & use recommended 60/20/20 defaults →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Budget Split & Strategy */}
          {step === 1 && (
            <motion.div
              key="step-split"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="space-y-5"
            >
              <div className="glass-strong rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Pick Your Strategy</h2>
                    <p className="text-xs text-white/60">
                      Choose a template or customize percentages freely
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={autoBalance}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-xs font-semibold text-neon-cyan glow-cyan transition-transform active:scale-95"
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Auto-Balance (100%)
                  </button>
                </div>

                {/* Strategy Cards */}
                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {PRESET_STRATEGIES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => applyPreset(st.id)}
                      className={`rounded-2xl p-3 text-left transition-all ${
                        activeStrategy === st.id
                          ? "border border-neon-purple/70 bg-neon-purple/20 shadow-lg"
                          : "glass hover:bg-white/10"
                      }`}
                    >
                      <div className="text-lg">{st.icon}</div>
                      <div className="mt-1 text-xs font-bold text-white">{st.label}</div>
                      <div className="mt-0.5 line-clamp-2 text-[10px] text-white/60">{st.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Bucket Breakdown Meter */}
                <div className="mt-6 rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Distribution Meter</span>
                    <span
                      className={
                        totals.sum === 100
                          ? "text-neon-green"
                          : totals.sum > 100
                            ? "text-neon-red"
                            : "text-neon-amber"
                      }
                    >
                      Total: {totals.sum}%{" "}
                      {totals.sum === 100
                        ? "✓ Balanced"
                        : `(${totals.sum > 100 ? "+" : ""}${totals.sum - 100}%)`}
                    </span>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="mt-2.5 flex h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      style={{ width: `${Math.min(100, totals.buckets.needs)}%` }}
                      className="bg-[#06B6D4] transition-all"
                      title={`Needs: ${totals.buckets.needs}%`}
                    />
                    <div
                      style={{ width: `${Math.min(100, totals.buckets.wants)}%` }}
                      className="bg-[#EC4899] transition-all"
                      title={`Wants: ${totals.buckets.wants}%`}
                    />
                    <div
                      style={{ width: `${Math.min(100, totals.buckets.savings)}%` }}
                      className="bg-[#10B981] transition-all"
                      title={`Savings: ${totals.buckets.savings}%`}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-[#06B6D4]/15 p-2">
                      <span className="block text-[10px] uppercase text-[#06B6D4]">Needs</span>
                      <span className="font-bold text-white">{totals.buckets.needs}%</span>
                    </div>
                    <div className="rounded-xl bg-[#EC4899]/15 p-2">
                      <span className="block text-[10px] uppercase text-[#EC4899]">Wants</span>
                      <span className="font-bold text-white">{totals.buckets.wants}%</span>
                    </div>
                    <div className="rounded-xl bg-[#10B981]/15 p-2">
                      <span className="block text-[10px] uppercase text-[#10B981]">Savings</span>
                      <span className="font-bold text-white">{totals.buckets.savings}%</span>
                    </div>
                  </div>
                </div>

                {/* Categories List with Sliders & Toggles */}
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Categories ({totals.enabledCount} active)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddCat(!showAddCat)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neon-purple hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Category
                    </button>
                  </div>

                  {/* Inline Add Category Form */}
                  <AnimatePresence>
                    {showAddCat && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-2xl border border-neon-purple/40 bg-white/10 p-3.5"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCatIcon}
                            onChange={(e) => setNewCatIcon(e.target.value)}
                            className="w-10 rounded-xl bg-white/10 text-center text-lg"
                            placeholder="Emoji"
                          />
                          <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="flex-1 rounded-xl bg-white/10 px-3 text-xs text-white outline-none"
                            placeholder="Category name (e.g. Church Offering, Gym)"
                          />
                          <select
                            value={newCatBucket}
                            onChange={(e) =>
                              setNewCatBucket(e.target.value as DefaultCategory["bucket"])
                            }
                            className="rounded-xl bg-white/10 px-2 text-xs text-white"
                          >
                            <option value="needs" className="bg-slate-900">
                              Needs
                            </option>
                            <option value="wants" className="bg-slate-900">
                              Wants
                            </option>
                            <option value="savings" className="bg-slate-900">
                              Savings
                            </option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            className="rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-bold text-white glow-purple"
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {categories.map((c, i) => (
                    <div
                      key={c.id}
                      className={`rounded-2xl p-3 transition-all ${
                        c.enabled ? "glass" : "bg-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={c.enabled}
                            onChange={() => toggleCategory(c.id)}
                            className="h-4 w-4 rounded accent-neon-purple"
                          />
                          <span className="text-base">{c.icon}</span>
                          <span className="font-semibold text-white">{c.name}</span>
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[9px] uppercase font-bold"
                            style={{
                              backgroundColor: `${BUCKET_META[c.bucket].color}25`,
                              color: BUCKET_META[c.bucket].color,
                            }}
                          >
                            {c.bucket}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {c.pct}% · {formatNaira(Math.round((c.pct / 100) * allowance))}
                          </span>
                          {!c.id.startsWith("cat-") && (
                            <button
                              type="button"
                              onClick={() => removeCategory(c.id)}
                              className="text-white/40 hover:text-neon-red"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {c.enabled && (
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={60}
                            value={c.pct}
                            onChange={(e) => {
                              setActiveStrategy("custom");
                              const next = [...categories];
                              next[i] = { ...c, pct: Number(e.target.value) };
                              setCategories(next);
                            }}
                            className="flex-1 accent-neon-purple"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Balance validation alert if not 100% */}
                {totals.sum !== 100 && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-neon-amber/30 bg-neon-amber/10 p-3 text-xs text-neon-amber">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>
                        Current total is <strong>{totals.sum}%</strong>. Needs to be 100%.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={autoBalance}
                      className="font-bold underline hover:text-white"
                    >
                      Fix automatically
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 rounded-2xl glass py-3 font-semibold text-white/80 active:scale-95"
                >
                  <ArrowLeft className="mr-1 inline h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (totals.sum !== 100) autoBalance();
                    setStep(2);
                  }}
                  className="flex-1 rounded-2xl bg-gradient-primary py-3 font-bold text-white glow-purple active:scale-95"
                >
                  Review Budget <ArrowRight className="ml-1 inline h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review & First Savings Target */}
          {step === 2 && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="space-y-5"
            >
              <div className="glass-strong rounded-3xl p-6 sm:p-8">
                <div className="text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-white glow-purple">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black">Ready to launch!</h2>
                  <p className="mt-1 text-xs text-white/60">
                    Here is your monthly roadmap for {formatNaira(allowance)}
                  </p>
                </div>

                {/* Summary stat cards */}
                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-[10px] text-white/50">Needs</span>
                    <div className="mt-1 font-bold text-[#06B6D4]">
                      {formatNaira(Math.round((totals.buckets.needs / 100) * allowance))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-[10px] text-white/50">Wants</span>
                    <div className="mt-1 font-bold text-[#EC4899]">
                      {formatNaira(Math.round((totals.buckets.wants / 100) * allowance))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="text-[10px] text-white/50">Savings</span>
                    <div className="mt-1 font-bold text-[#10B981]">
                      {formatNaira(Math.round((totals.buckets.savings / 100) * allowance))}
                    </div>
                  </div>
                </div>

                {/* Optional Savings Goal Setup */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-neon-green" />
                      <span className="text-xs font-bold text-white">
                        Create First Savings Goal
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={setGoal}
                      onChange={(e) => setSetGoal(e.target.checked)}
                      className="h-4 w-4 rounded accent-neon-green"
                    />
                  </div>

                  {setGoal && (
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        placeholder="Goal name (e.g. Emergency Fund, New Laptop)"
                        className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-white placeholder-white/40 outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/60">Target: ₦</span>
                        <input
                          type="number"
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
                          className="flex-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories preview chips */}
                <div className="mt-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Active Categories
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories
                      .filter((c) => c.enabled && c.pct > 0)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-xl glass px-2.5 py-1.5 text-[11px]"
                        >
                          <span className="truncate">
                            {c.icon} {c.name}
                          </span>
                          <span className="font-bold text-white/80">{c.pct}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Finish Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={finishOnboarding}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 font-bold text-white glow-purple active:scale-98 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start Managing My Money 🚀
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-3 w-full py-1 text-center text-xs text-white/50 hover:text-white"
                >
                  ← Edit allocations
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
