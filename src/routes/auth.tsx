import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Sparkles, ShieldCheck, Wallet, Target } from "lucide-react";
import { Logo } from "@/components/Logo";
import students from "@/assets/students.jpg";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? "signup" : s.mode === "forgot" ? "forgot" : "login",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initial as Mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [allowance, setAllowance] = useState("40000");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/home" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
            data: { full_name: name, monthly_allowance: Number(allowance || 0) },
          },
        });
        if (error) throw error;
        toast.success("Account created! Let's set up your budget ✨");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back 👋");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
        });
        if (error) throw error;
        toast.success("Reset link sent — check your inbox.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back";
  const subtitle =
    mode === "signup"
      ? "Start saving smarter today"
      : mode === "forgot"
        ? "Enter your email and we'll send a reset link"
        : "Log in to keep crushing it";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* glow bg */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/40 blur-3xl animate-float-slow" />
        <div
          className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-neon-pink/40 blur-3xl animate-float-slow"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute top-1/3 left-1/2 h-[24rem] w-[24rem] rounded-full bg-neon-cyan/25 blur-3xl animate-float-slow"
          style={{ animationDelay: "-9s" }}
        />
      </div>

      {/* top bar */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <Logo size="sm" />
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Visual / illustration side */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-primary opacity-30 blur-3xl" />
            <img
              src={students}
              alt="Students using StudentFinance+"
              className="w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl"
            />

            {/* floating stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-4 top-10 flex items-center gap-2 rounded-2xl glass-strong px-3 py-2 text-xs font-semibold shadow-xl"
            >
              <Wallet className="h-4 w-4 text-neon-green" /> ₦12,400 saved this week
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -right-4 top-1/3 flex items-center gap-2 rounded-2xl glass-strong px-3 py-2 text-xs font-semibold shadow-xl"
            >
              <Target className="h-4 w-4 text-neon-cyan" /> Goal: Laptop 64%
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="absolute bottom-8 left-1/3 flex items-center gap-2 rounded-2xl glass-strong px-3 py-2 text-xs font-semibold shadow-xl"
            >
              <Sparkles className="h-4 w-4 text-neon-amber" /> 7-day streak 🔥
            </motion.div>
          </motion.div>

          <div className="mt-10">
            <h2 className="text-3xl font-black tracking-tight">
              Smart budgets for <span className="text-gradient">Nigerian students</span>.
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/65">
              Join thousands of students saving smarter every month. No bank login. No stress.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-white/60">
              <ShieldCheck className="h-4 w-4 text-neon-green" /> Your data is end-to-end private
            </div>
          </div>
        </div>

        {/* Form side */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-strong relative w-full max-w-md justify-self-center rounded-3xl p-7 sm:p-9 lg:max-w-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-2xl font-black text-white glow-purple">
                  ₦
                </div>
                <h1 className="mt-4 text-2xl font-bold">{title}</h1>
                <p className="mt-1 text-sm text-white/60">{subtitle}</p>
              </div>

              <form onSubmit={submit} className="mt-6 space-y-3">
                {mode === "signup" && (
                  <>
                    <Field label="Full name">
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Olu Adeyemi"
                        className="auth-input"
                      />
                    </Field>
                    <Field label="Monthly allowance (₦)">
                      <input
                        required
                        type="number"
                        min={0}
                        value={allowance}
                        onChange={(e) => setAllowance(e.target.value)}
                        className="auth-input"
                      />
                    </Field>
                  </>
                )}
                <Field label="Email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu.ng"
                      className="auth-input pl-10"
                    />
                  </div>
                </Field>
                {mode !== "forgot" && (
                  <Field label="Password">
                    <div className="relative">
                      <input
                        required
                        type={showPwd ? "text" : "password"}
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="auth-input pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                )}

                {mode === "login" && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-medium text-white/70 hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white glow-purple transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-white/70">
                {mode === "forgot" ? (
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-semibold text-gradient"
                  >
                    ← Back to log in
                  </button>
                ) : mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-gradient"
                    >
                      Log in
                    </button>
                  </>
                ) : (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="font-semibold text-gradient"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: white;
          padding: 0.75rem 0.95rem;
          border-radius: 0.95rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .auth-input:focus {
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.25);
          background: rgba(255,255,255,0.08);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.45); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
