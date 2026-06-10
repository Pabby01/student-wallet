import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { formatNaira } from "@/lib/format";
import { scanReceipt } from "@/lib/api/receipts.functions";
import { toast } from "sonner";
import { Loader2, ScanLine, X, Plus, Check, Image as ImageIcon } from "lucide-react";

type Category = { id: string; name: string; icon: string | null; color: string | null; allocated: number; spent: number };

const EMOJIS = ["💸", "🍲", "🚌", "📚", "📱", "🎮", "🍔", "🛍️", "💰", "🏠", "🎬", "✈️", "⚡", "🎁"];

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
  const [scanning, setScanning] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scanFn = useServerFn(scanReceipt);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("💸");
  const [creatingCat, setCreatingCat] = useState(false);

  async function loadCats() {
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("id, name, icon, color, allocated, spent")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    let list = (data ?? []) as Category[];
    // Auto-seed defaults if empty so the user never gets stuck.
    if (list.length === 0) {
      const rows = DEFAULT_CATEGORIES.map((d) => ({
        user_id: user.id,
        name: d.name,
        icon: d.icon,
        color: d.color,
        bucket: d.bucket,
        allocated: 0,
        spent: 0,
      }));
      const { data: inserted } = await supabase.from("categories").insert(rows).select("id, name, icon, color, allocated, spent");
      list = (inserted ?? []) as Category[];
    }
    setCats(list);
    setCategoryId((prev) => prev ?? list[0]?.id ?? null);
  }

  useEffect(() => {
    if (!open || !user) return;
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  function reset() {
    setAmount(""); setMerchant(""); setDescription(""); setScanned(false);
    setDate(new Date().toISOString().slice(0, 10));
    setShowNewCat(false); setNewCatName(""); setNewCatIcon("💸");
    setReceiptUrl(null); setReceiptPreview(null);
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }

  async function handleReceiptFile(file: File) {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Image is larger than 8 MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Pick an image file"); return; }
    setScanning(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setReceiptPreview(dataUrl);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("receipts").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (upErr) throw upErr;
      setReceiptUrl(path);
      const result = await scanFn({ data: { imageDataUrl: dataUrl } });
      let filled = 0;
      if (result.amount != null) { setAmount(String(result.amount)); filled++; }
      if (result.merchant) { setMerchant(result.merchant); filled++; }
      if (result.date) { setDate(result.date); filled++; }
      if (result.description) { setDescription(result.description); filled++; }
      if (result.categoryHint) {
        const hint = result.categoryHint.toLowerCase();
        const match = cats.find((c) => c.name.toLowerCase().includes(hint) || hint.includes(c.name.toLowerCase()));
        if (match) setCategoryId(match.id);
      }
      setScanned(true);
      if (filled === 0) toast.warning("Couldn't read the receipt — please fill in manually");
      else toast.success(`Scanned ✨ ${filled} field${filled === 1 ? "" : "s"} filled — please review`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function createCategory() {
    if (!user) return;
    const name = newCatName.trim();
    if (!name) { toast.error("Name your category"); return; }
    setCreatingCat(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ user_id: user.id, name, icon: newCatIcon, color: "#8B5CF6", bucket: "wants", allocated: 0, spent: 0 })
        .select("id, name, icon, color, allocated, spent")
        .single();
      if (error) throw error;
      const next = [...cats, data as Category];
      setCats(next);
      setCategoryId((data as Category).id);
      setShowNewCat(false); setNewCatName(""); setNewCatIcon("💸");
      toast.success("Category added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreatingCat(false);
    }
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
        description: description || null, was_scanned: scanned, receipt_url: receiptUrl,
      });
      if (error) throw error;
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


  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          {/* Wrapper centers on sm+, bottom-sheet on mobile */}
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 pointer-events-none">
            <motion.div
              initial={{ y: "100%", opacity: 0.5, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="pointer-events-auto w-full max-h-[92vh] overflow-y-auto rounded-t-3xl glass-strong p-5 pb-8 sm:max-w-lg sm:rounded-3xl sm:p-6"
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/30 sm:hidden" />
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">Log expense</h3>
                <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleReceiptFile(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={scanning}
                onClick={() => fileInputRef.current?.click()}
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl glass border border-neon-cyan/40 py-2.5 text-sm font-semibold text-neon-cyan glow-cyan disabled:opacity-60"
              >
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                {scanning ? "Scanning receipt…" : "Scan receipt with camera"}
              </button>

              {receiptPreview && (
                <div className="mb-3 flex items-center gap-3 rounded-2xl glass p-2.5">
                  <img src={receiptPreview} alt="Receipt" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 text-xs text-white/70">
                    <div className="font-semibold text-white">Receipt attached</div>
                    <div>{scanned ? "AI extracted — review fields below" : "Uploaded"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setReceiptPreview(null); setReceiptUrl(null); setScanned(false); }}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"
                    aria-label="Remove receipt"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <Field label="Amount (₦)">
                <input inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0" className="ax-input text-2xl font-bold" />
              </Field>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/70">Category</span>
                  <button
                    type="button"
                    onClick={() => setShowNewCat((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-neon-cyan hover:bg-white/10"
                  >
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {cats.map((c) => {
                    const active = c.id === categoryId;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategoryId(c.id)}
                        className={`rounded-2xl p-2.5 text-left transition-all ${active ? "bg-gradient-primary text-white glow-purple" : "glass hover:bg-white/10"}`}
                      >
                        <div className="text-lg">{c.icon || "💸"}</div>
                        <div className="mt-0.5 truncate text-[11px] font-medium">{c.name}</div>
                      </button>
                    );
                  })}
                  {cats.length === 0 && (
                    <div className="col-span-3 rounded-2xl glass p-4 text-center text-xs text-white/60 sm:col-span-4">
                      Loading categories…
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showNewCat && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="rounded-2xl glass p-3">
                        <div className="flex gap-2">
                          <input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Category name"
                            className="ax-input flex-1"
                          />
                          <button
                            type="button"
                            onClick={createCategory}
                            disabled={creatingCat}
                            className="inline-flex items-center gap-1 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-white glow-purple disabled:opacity-60"
                          >
                            {creatingCat ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Add
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => setNewCatIcon(e)}
                              className={`grid h-8 w-8 place-items-center rounded-lg text-base transition-all ${
                                newCatIcon === e ? "bg-gradient-primary glow-purple" : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ax-input" />
                </Field>
                <Field label="Merchant">
                  <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Cafeteria" className="ax-input" />
                </Field>
              </div>

              <Field label="Note (optional)">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="ax-input" />
              </Field>

              <button disabled={saving} onClick={save}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 font-semibold text-white glow-purple active:scale-[0.98] disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save expense
              </button>

              <style>{`
                .ax-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: white; padding: 0.7rem 0.9rem; border-radius: 0.9rem; font-size: 0.9rem; outline: none; }
                .ax-input:focus { border-color: rgba(139,92,246,0.7); box-shadow: 0 0 0 3px rgba(139,92,246,0.25); }
                .ax-input::placeholder { color: rgba(255,255,255,0.45); }
              `}</style>
            </motion.div>
          </div>
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

export { DEFAULT_CATEGORIES };
