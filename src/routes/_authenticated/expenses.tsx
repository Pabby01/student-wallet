import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: Expenses,
});

type Exp = { id: string; amount: number; merchant: string | null; description: string | null; date: string; category_id: string | null; receipt_url: string | null; categories: { name: string; icon: string | null; color: string | null } | null };

function Expenses() {
  const { user } = useAuth();
  const [list, setList] = useState<Exp[]>([]);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("expenses")
      .select("id, amount, merchant, description, date, category_id, receipt_url, categories(name, icon, color)")
      .eq("user_id", user.id).order("date", { ascending: false }).order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setList((data ?? []) as unknown as Exp[]));
  }, [user, tick]);

  async function del(e: Exp) {
    if (!user) return;
    if (!confirm("Delete this expense?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    if (e.category_id) {
      const { data: cat } = await supabase.from("categories").select("spent").eq("id", e.category_id).maybeSingle();
      if (cat) await supabase.from("categories").update({ spent: Math.max(0, Number(cat.spent) - Number(e.amount)) }).eq("id", e.category_id);
    }
    toast.success("Deleted");
    setTick((t) => t + 1);
  }

  const grouped = list.reduce<Record<string, Exp[]>>((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});

  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Expenses</h1>
      <p className="text-sm text-white/60">Every naira, tracked.</p>

      <div className="mt-5 space-y-5">
        {Object.entries(grouped).map(([d, items]) => {
          const total = items.reduce((s, x) => s + Number(x.amount), 0);
          return (
            <div key={d}>
              <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                <span className="font-semibold uppercase tracking-wider">{new Date(d).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })}</span>
                <span>{formatNaira(total)}</span>
              </div>
              <div className="space-y-2">
                {items.map((e) => (
                  <motion.div key={e.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass flex items-center justify-between rounded-2xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg">{e.categories?.icon ?? "💸"}</div>
                      <div>
                        <div className="text-sm font-medium">{e.merchant || e.categories?.name || "Expense"}</div>
                        <div className="text-[11px] text-white/55">{e.categories?.name}{e.description ? ` · ${e.description}` : ""}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold">{formatNaira(e.amount)}</div>
                      <button onClick={() => del(e)} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-neon-red">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-white/60">No expenses yet. Tap + to add one ✨</div>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.92 }} onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-white glow-purple">
        <Plus className="h-6 w-6" />
      </motion.button>
      <AddExpenseSheet open={open} onClose={() => setOpen(false)} onSaved={() => setTick((t) => t + 1)} />
    </AppShell>
  );
}
