import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";
import { Loader2, ScanLine, X } from "lucide-react";

type Category = { id: string; name: string; icon: string | null; color: string | null; allocated: number; spent: number };

export function AddExpenseSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    supabase.from("categories").select("id, name, icon, color, allocated, spent").eq("user_id", user.id).then(({ data }) => {
      const list = (data ?? []) as Category[];
      setCats(list);
      if (!categoryId && list[0]) setCategoryId(list[0].id);
    });
  }, [open, user, categoryId]);

  function reset() {
    setAmount(""); setMerchant(""); setDescription(""); setScanned(false);
    setDate(new Date().toISOString().slice(0, 10));
  }

  async function maybeAlert(catId: string) {
    if (!user) return;
    const { data } = await supabase.from("categories").select("name, allocated, spent").eq("id", catId).maybeSingle();
    if (!data || !data.allocated) return;
    const p = Math.round((Number(data.spent) / Number(data.allocated)) * 100);
    let type: "budget_75" | "budget_90" | "budget_100" | null = null;
    let msg = "";
    if (p >= 100) { type = "budget_100"; msg = `🚨 You've blown your ${data.name} budget (${p}%).`; }
    else if (p >= 90) { type = "budget_90"; msg = `⚠️ ${p}% of ${data.name} used — only ${formatNaira(Number(data.allocated) - Number(data.spent))} left.`; }
    else if (p >= 75) { type = "budget_75"; msg = `💡 Heads up — ${p}% of ${data.name} spent.`; }
    if (!type) return;
    // Throttle: max 3 same-type alerts per category per day
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("category_id", catId).eq("alert_type", type)
      .gte("created_at", today.toISOString());
    if ((count ?? 0) >= 3) return;
    await supabase.from("alerts").insert({ user_id: user.id, category_id: catId, alert_type: type, message: msg });
    if (type === "budget_100") toast.error(msg);
    else if (type === "budget_90") toast.warning(msg);
    else toast.info(msg);
  }

  async function save() {
    if (!user) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!categoryId) { toast.error("Pick a category"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id, category_id: categoryId, amount: amt, date, merchant: merchant || null,
        description: description || null, was_scanned: scanned,
      });
      if (error) throw error;
      // Bump category.spent
      const cat = cats.find((c) => c.id === categoryId);
      if (cat) {
        await supabase.from("categories").update({ spent: Number(cat.spent) + amt }).eq("id", categoryId);
      }
      toast.success("Expense logged ✨");
      await maybeAlert(categoryId);
      reset();
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function mockScan() {
    // Demo OCR — pretends to read a receipt.
    setScanned(true);
    setAmount("8500");
    setMerchant("University Bookstore");
    setDescription("Scanned receipt (demo)");
    const academic = cats.find((c) => c.name.toLowerCase().includes("academic"));
    if (academic) setCategoryId(academic.id);
    toast.success("Receipt scanned: ₦8,500 at University Bookstore");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl glass-strong p-5 pb-8">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/30" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Log expense</h3>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <button onClick={mockScan} className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl glass border border-neon-cyan/40 py-2.5 text-sm font-semibold text-neon-cyan glow-cyan">
              <ScanLine className="h-4 w-4" /> Scan receipt (demo)
            </button>

            <Field label="Amount (₦)">
              <input inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0" className="input text-2xl font-bold" />
            </Field>

            <div className="mt-3">
              <div className="mb-1 text-xs font-medium text-white/70">Category</div>
              <div className="grid grid-cols-3 gap-2">
                {cats.map((c) => {
                  const active = c.id === categoryId;
                  return (
                    <button key={c.id} onClick={() => setCategoryId(c.id)}
                      className={`rounded-2xl p-2.5 text-left transition-all ${active ? "bg-gradient-primary text-white glow-purple" : "glass hover:bg-white/10"}`}>
                      <div className="text-lg">{c.icon || "💸"}</div>
                      <div className="mt-0.5 truncate text-[11px] font-medium">{c.name}</div>
                    </button>
                  );
                })}
                {cats.length === 0 && (
                  <div className="col-span-3 rounded-2xl glass p-4 text-center text-xs text-white/60">
                    No categories yet — finish onboarding.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              </Field>
              <Field label="Merchant">
                <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Cafeteria" className="input" />
              </Field>
            </div>

            <Field label="Note (optional)">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input" />
            </Field>

            <button disabled={saving} onClick={save}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-[0.98] disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save expense
            </button>

            <style>{`
              .input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: white; padding: 0.7rem 0.9rem; border-radius: 0.9rem; font-size: 0.9rem; outline: none; }
              .input:focus { border-color: rgba(139,92,246,0.7); box-shadow: 0 0 0 3px rgba(139,92,246,0.25); }
              .input::placeholder { color: rgba(255,255,255,0.45); }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}

// Re-export default categories list for callers if they want it
export { DEFAULT_CATEGORIES };
