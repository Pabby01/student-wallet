import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Download, RotateCw, PlayCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { Walkthrough } from "@/components/Walkthrough";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [dept, setDept] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [allowance, setAllowance] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [replayTour, setReplayTour] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.full_name ?? "");
        setMatric(data?.matric_number ?? "");
        setDept(data?.department ?? "");
        setYear(data?.year_of_study ?? "");
        setAllowance(Number(data?.monthly_allowance ?? 0));
      });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        matric_number: matric,
        department: dept,
        year_of_study: year || null,
        monthly_allowance: Number(allowance) || 0,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  async function exportCsv() {
    if (!user) return;
    const { data } = await supabase
      .from("expenses")
      .select("date, amount, merchant, description, categories(name)")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    const rows: string[][] = [["date", "amount", "category", "merchant", "description"]];
    (
      (data as Array<{
        date: string;
        amount: number;
        merchant: string | null;
        description: string | null;
        categories: { name: string } | null;
      }>) ?? []
    ).forEach((e) =>
      rows.push([
        e.date,
        String(e.amount),
        e.categories?.name ?? "",
        e.merchant ?? "",
        e.description ?? "",
      ]),
    );
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function resetBudget() {
    if (!user) return;
    if (!confirm("Reset all category 'spent' values to 0 and start fresh?")) return;
    const { error } = await supabase.from("categories").update({ spent: 0 }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Budget reset");
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-white/60">Your profile & app preferences.</p>

      <div className="mt-5 space-y-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase text-white/60">Profile</div>
          <Input label="Full name" value={name} onChange={setName} />
          <Input label="Matric number" value={matric} onChange={setMatric} />
          <Input label="Department" value={dept} onChange={setDept} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Year"
              value={String(year)}
              type="number"
              onChange={(v) => setYear(v ? Number(v) : "")}
            />
            <Input
              label="Monthly allowance (₦)"
              value={String(allowance)}
              type="number"
              onChange={(v) => setAllowance(v ? Number(v) : "")}
            />
          </div>
          <button
            disabled={saving}
            onClick={save}
            className="mt-3 w-full rounded-2xl bg-gradient-primary py-2.5 text-sm font-semibold text-white glow-purple active:scale-95 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <button
          onClick={exportCsv}
          className="glass flex w-full items-center justify-between rounded-2xl p-4 text-sm hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export expenses as CSV
          </span>
          <span>→</span>
        </button>

        <button
          onClick={resetBudget}
          className="glass flex w-full items-center justify-between rounded-2xl p-4 text-sm hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" /> Reset monthly spent
          </span>
          <span>→</span>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("sf_walkthrough_done_v1");
            setReplayTour(true);
          }}
          className="glass flex w-full items-center justify-between rounded-2xl p-4 text-sm hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" /> Replay welcome tour
          </span>
          <span>→</span>
        </button>
        <ChangePasswordCard />

        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
          className="glass flex w-full items-center justify-between rounded-2xl border border-neon-red/40 p-4 text-sm text-neon-red hover:bg-neon-red/10"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </span>
          <span>→</span>
        </button>
      </div>
      {replayTour && <Walkthrough force onDone={() => setReplayTour(false)} />}
    </AppShell>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-neon-purple/70 focus:ring-2 focus:ring-neon-purple/30"
      />
    </label>
  );
}

function ChangePasswordCard() {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function update() {
    if (pwd.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (pwd !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPwd("");
    setConfirm("");
    toast.success("Password updated");
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/60">
        <KeyRound className="h-3.5 w-3.5" /> Change password
      </div>
      <div className="mt-3 space-y-3">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 pr-10 text-sm outline-none focus:border-neon-purple/70 focus:ring-2 focus:ring-neon-purple/30"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg hover:bg-white/10"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-neon-purple/70 focus:ring-2 focus:ring-neon-purple/30"
        />
        <button
          onClick={update}
          disabled={busy}
          className="w-full rounded-2xl bg-gradient-primary py-2.5 text-sm font-semibold text-white glow-purple active:scale-95 disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </div>
    </div>
  );
}
