import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alerts")({
  component: Alerts,
});

type Alert = { id: string; alert_type: string | null; message: string | null; was_read: boolean | null; action_taken: boolean | null; created_at: string | null };

function Alerts() {
  const { user } = useAuth();
  const [list, setList] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setList((data ?? []) as Alert[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel(`alerts:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function markRead(a: Alert) {
    await supabase.from("alerts").update({ was_read: true }).eq("id", a.id);
    setList((l) => l.map((x) => (x.id === a.id ? { ...x, was_read: true } : x)));
  }

  async function takeAction(a: Alert) {
    await supabase.from("alerts").update({ action_taken: true, was_read: true }).eq("id", a.id);
    setList((l) => l.map((x) => (x.id === a.id ? { ...x, was_read: true, action_taken: true } : x)));
    toast.success("Marked as handled 👍");
  }

  async function removeAlert(a: Alert) {
    await supabase.from("alerts").delete().eq("id", a.id);
    setList((l) => l.filter((x) => x.id !== a.id));
  }

  async function markAllRead() {
    if (!user) return;
    const unread = list.filter((a) => !a.was_read);
    if (unread.length === 0) return;
    await supabase.from("alerts").update({ was_read: true }).eq("user_id", user.id).eq("was_read", false);
    setList((l) => l.map((x) => ({ ...x, was_read: true })));
    toast.success(`Marked ${unread.length} as read`);
  }

  async function clearAll() {
    if (!user) return;
    if (!confirm("Delete all alerts? This can't be undone.")) return;
    await supabase.from("alerts").delete().eq("user_id", user.id);
    setList([]);
  }

  const unread = list.filter((a) => !a.was_read).length;

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-neon-amber" />
          <h1 className="text-2xl font-bold">Alerts</h1>
          {unread > 0 && (
            <span className="rounded-full bg-neon-red/20 px-2 py-0.5 text-[11px] font-semibold text-neon-red">
              {unread} new
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="inline-flex items-center gap-1 rounded-xl glass px-3 py-1.5 text-xs font-semibold hover:bg-white/10">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
          {list.length > 0 && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 rounded-xl glass px-3 py-1.5 text-xs font-semibold text-neon-red hover:bg-neon-red/10">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-white/60">Live budget threshold notifications.</p>

      <div className="mt-5 space-y-2">
        {list.map((a) => {
          const tone =
            a.alert_type === "budget_100"
              ? "border-neon-red/40 bg-neon-red/10"
              : a.alert_type === "budget_90"
                ? "border-neon-amber/40 bg-neon-amber/10"
                : "border-white/10 bg-white/5";
          return (
            <div key={a.id} className={`glass flex items-start justify-between gap-3 rounded-2xl border p-3 ${tone}`}>
              <div className="flex-1">
                <div className={`text-sm ${a.was_read ? "text-white/70" : "font-semibold"}`}>{a.message}</div>
                <div className="mt-1 text-[11px] text-white/50">
                  {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!a.was_read && (
                    <button onClick={() => markRead(a)} className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                      Mark read
                    </button>
                  )}
                  {!a.action_taken && (
                    <button
                      onClick={() => takeAction(a)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-2.5 py-1 text-[11px] font-semibold text-white"
                    >
                      <Check className="h-3 w-3" /> I handled it
                    </button>
                  )}
                  {a.action_taken && <span className="text-[11px] text-neon-green">✅ Done</span>}
                  <button
                    onClick={() => removeAlert(a)}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/50 hover:bg-white/10 hover:text-neon-red"
                    aria-label="Delete alert"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && list.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-white/60">All quiet 🎶 No alerts yet.</div>
        )}
        {loading && list.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-white/60">Loading…</div>
        )}
      </div>
    </AppShell>
  );
}
