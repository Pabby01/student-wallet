import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (user) navigate({ to: "/home" });
    }
  }, [user, loading, navigate]);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/40 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-neon-pink/40 blur-3xl animate-float-slow" style={{ animationDelay: "-4s" }} />
        <div className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-neon-cyan/40 blur-3xl animate-float-slow" style={{ animationDelay: "-8s" }} />
      </div>
      <div className="mx-auto max-w-md text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-primary text-4xl font-black text-white glow-purple"
        >
          ₦
        </motion.div>
        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-4xl font-black tracking-tight"
        >
          Student<span className="text-gradient">Finance+</span>
        </motion.h1>
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 text-sm text-white/70"
        >
          Cash-first expense tracking and smart budgets, built for Nigerian uni life. Crush goals, dodge broke weeks ✨
        </motion.p>
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-col gap-3"
        >
          <a
            href="/auth?mode=signup"
            className="rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-white glow-purple transition-transform active:scale-95"
          >
            Get started — it's free
          </a>
          <a
            href="/auth"
            className="rounded-2xl glass px-6 py-3.5 text-sm font-semibold transition-transform active:scale-95"
          >
            I already have an account
          </a>
        </motion.div>
        <div className="mt-10 grid grid-cols-3 gap-3 text-left">
          {[
            { t: "Cash-first", d: "No bank login." },
            { t: "AI alerts", d: "Before you overspend." },
            { t: "Goals", d: "Save with confetti 🎉" },
          ].map((f) => (
            <div key={f.t} className="glass rounded-2xl p-3">
              <div className="text-xs font-semibold">{f.t}</div>
              <div className="mt-0.5 text-[11px] text-white/60">{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
