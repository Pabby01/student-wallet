import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TiltCard } from "@/components/TiltCard";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — StudentFinance+" },
      {
        name: "description",
        content:
          "Get in touch with the StudentFinance+ team. Questions, partnership ideas, feedback — we read everything.",
      },
      { property: "og:title", content: "Contact StudentFinance+" },
      { property: "og:description", content: "We'd love to hear from you. Reach out anytime." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(5, "Tell us a bit more").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    // Simulated send — wire to a server fn later
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    toast.success("Message sent! We'll get back to you soon.");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-white/80">
            <MessageCircle className="h-3.5 w-3.5 text-neon-cyan" /> We reply within 24 hours
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Let's <span className="text-gradient">talk money</span>.
          </h1>
          <p className="mt-4 text-base text-white/70">
            Got a feature request? Bug to report? Want us at your campus? Drop us a line.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Info cards */}
          <div className="space-y-4 lg:col-span-2">
            {[
              {
                Icon: Mail,
                label: "Email",
                value: "hello@studentfinanceplus.ng",
                tint: "from-neon-purple to-neon-pink",
              },
              {
                Icon: MessageCircle,
                label: "WhatsApp",
                value: "+234 800 000 0000",
                tint: "from-neon-cyan to-neon-purple",
              },
              {
                Icon: MapPin,
                label: "Campus HQ",
                value: "FUNAAB, Abeokuta, Nigeria",
                tint: "from-neon-amber to-neon-pink",
              },
            ].map(({ Icon, label, value, tint }, i) => (
              <TiltCard key={label} className="rounded-3xl" max={8}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass flex items-center gap-4 rounded-3xl p-5"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tint} glow-purple`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/55">{label}</div>
                    <div className="text-sm font-semibold">{value}</div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
            <div className="glass rounded-3xl p-5 text-sm text-white/70">
              <p className="font-semibold text-white">Looking for help with your account?</p>
              <p className="mt-1">
                Most answers live on our{" "}
                <Link to="/faq" className="text-neon-cyan hover:underline">
                  FAQ page
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submit}
            className="glass-strong space-y-4 rounded-3xl p-6 lg:col-span-3 lg:p-8"
          >
            {sent ? (
              <div className="grid place-items-center py-16 text-center">
                <CheckCircle2 className="h-14 w-14 text-neon-green" />
                <h3 className="mt-4 text-2xl font-bold">Message sent</h3>
                <p className="mt-2 text-sm text-white/70">We'll get back to you within 24 hours.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  className="mt-6 rounded-2xl glass px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name">
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Adeola Okafor"
                      className="contact-input"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@school.edu.ng"
                      className="contact-input"
                    />
                  </Field>
                </div>
                <Field label="Message">
                  <textarea
                    required
                    rows={6}
                    maxLength={1000}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind…"
                    className="contact-input resize-none"
                  />
                </Field>
                <button
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white glow-purple transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send message
                </button>
              </>
            )}
          </motion.form>
        </div>
      </section>

      <style>{`
        .contact-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: white;
          padding: 0.8rem 0.95rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .contact-input:focus {
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.25);
        }
        .contact-input::placeholder { color: rgba(255,255,255,0.45); }
      `}</style>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}
