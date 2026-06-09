import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Wallet, Receipt, Target, BarChart3, Bell } from "lucide-react";
import { Logo } from "./Logo";

const STORAGE_KEY = "sf_walkthrough_done_v1";

const STEPS = [
  {
    icon: Wallet,
    title: "Welcome to StudentFinance+",
    body: "Your personal money coach built for Nigerian uni life. Let's show you around in 30 seconds ✨",
    accent: "from-neon-purple to-neon-pink",
  },
  {
    icon: Receipt,
    title: "Log expenses in seconds",
    body: "Tap the glowing ➕ on the home screen to add cash spending. You can even scan receipts.",
    accent: "from-neon-pink to-neon-amber",
  },
  {
    icon: Target,
    title: "Set budgets & goals",
    body: "Split your allowance 60/20/20 — Needs, Wants, Savings — and unlock confetti when you hit milestones 🎉",
    accent: "from-neon-cyan to-neon-purple",
  },
  {
    icon: BarChart3,
    title: "See where your ₦ goes",
    body: "Beautiful charts show daily spend and category breakdowns so you spot leaks early.",
    accent: "from-neon-green to-neon-cyan",
  },
  {
    icon: Bell,
    title: "Smart alerts keep you safe",
    body: "We ping you before you overspend — no more broke weeks before month-end.",
    accent: "from-neon-amber to-neon-pink",
  },
];

export function Walkthrough({ force = false, onDone }: { force?: boolean; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (force || !localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, [force]);

  function close() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    onDone?.();
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  }

  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-md"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-6"
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 text-xs font-medium text-white/60 hover:text-white"
            >
              Skip
            </button>
            <div className="mb-5 flex items-center justify-between">
              <Logo size="sm" />
              <div className="text-[11px] font-medium text-white/60">
                {step + 1} / {STEPS.length}
              </div>
            </div>
            <div
              className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${s.accent} glow-purple`}
            >
              <Icon className="h-9 w-9 text-white" />
            </div>
            <h3 className="text-center text-xl font-bold">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-white/70">{s.body}</p>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-gradient-primary" : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white glow-purple transition-transform active:scale-[0.98]"
            >
              {step === STEPS.length - 1 ? (
                <>
                  <Check className="h-4 w-4" /> Let's go
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
