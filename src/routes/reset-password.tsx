import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sets the recovery session via URL hash automatically.
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        setReady(true);
      } else {
        // Wait for auth state to settle in case Supabase has already parsed
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) setReady(true);
          else toast.error("Reset link missing or expired. Request a new one.");
        });
      }
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Use at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated! Logging you in…");
      navigate({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/40 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-neon-pink/40 blur-3xl animate-float-slow" style={{ animationDelay: "-5s" }} />
      </div>
      <div className="absolute left-0 right-0 top-0 flex justify-center px-4 py-4">
        <Logo size="sm" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-strong w-full max-w-md rounded-3xl p-7"
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white glow-purple">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-white/60">Pick something strong — at least 6 characters.</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <PwdField
            label="New password"
            value={password}
            onChange={setPassword}
            show={showPwd}
            toggle={() => setShowPwd((v) => !v)}
          />
          <PwdField
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            show={showPwd}
            toggle={() => setShowPwd((v) => !v)}
          />
          <button
            disabled={loading || !ready}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white glow-purple transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>
      </motion.div>

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
        }
        .auth-input:focus {
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.25);
        }
      `}</style>
    </div>
  );
}

function PwdField({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
      <div className="relative">
        <input
          required
          minLength={6}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="auth-input pr-11"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
