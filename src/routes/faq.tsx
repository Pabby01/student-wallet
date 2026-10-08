import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, HelpCircle, Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — StudentFinance+" },
      {
        name: "description",
        content:
          "Answers to common questions about StudentFinance+: pricing, privacy, offline mode, supported phones, and more.",
      },
      { property: "og:title", content: "StudentFinance+ FAQ" },
      { property: "og:description", content: "Everything you need to know before signing up." },
    ],
  }),
  component: FAQPage,
});

const FAQS: { cat: string; q: string; a: string }[] = [
  {
    cat: "Pricing",
    q: "Is StudentFinance+ really free?",
    a: "Yes — completely free for students. We may add optional premium features later, but core budgeting will always be free.",
  },
  {
    cat: "Pricing",
    q: "Will I be charged later?",
    a: "No. We promise you'll never be charged for anything you signed up for under the free plan.",
  },
  {
    cat: "Privacy",
    q: "Is my data safe?",
    a: "Your data is encrypted at rest and in transit. Only you can see it. We never sell your data to anyone.",
  },
  {
    cat: "Privacy",
    q: "Do you share my info with my school?",
    a: "Never. Your account is private to you, even if you sign up with a school email.",
  },
  {
    cat: "Setup",
    q: "Do I have to link my bank?",
    a: "Nope. StudentFinance+ is cash-first. You can use it 100% without a bank account or card.",
  },
  {
    cat: "Setup",
    q: "How long does it take to set up?",
    a: "About 30 seconds. Enter your monthly allowance, pick your budget split, and you're tracking.",
  },
  {
    cat: "Features",
    q: "Does it work offline?",
    a: "Yes. Add expenses without internet; they sync automatically when you reconnect.",
  },
  {
    cat: "Features",
    q: "Can I track in naira and USD?",
    a: "Naira is the primary currency. USD tracking is on our roadmap.",
  },
  {
    cat: "Features",
    q: "Can I share a budget with my roommates?",
    a: "Shared roommate budgets are coming soon — drop us a note on the contact page to join the beta.",
  },
  {
    cat: "Support",
    q: "Which phones are supported?",
    a: "Any Android phone or iPhone with a modern browser (Chrome, Safari, Firefox). It works on tablets and laptops too.",
  },
  {
    cat: "Support",
    q: "How do I delete my account?",
    a: "Go to Settings → Account → Delete account. Everything is wiped within 7 days.",
  },
];

function FAQPage() {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase()),
  );
  const cats = Array.from(new Set(filtered.map((f) => f.cat)));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-white/80">
            <HelpCircle className="h-3.5 w-3.5 text-neon-cyan" /> Frequently asked
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Got <span className="text-gradient">questions?</span>
          </h1>
          <p className="mt-4 text-base text-white/70">
            We've got answers. Can't find what you need?{" "}
            <Link to="/contact" className="text-neon-cyan hover:underline">
              Reach out to us.
            </Link>
          </p>

          <div className="mx-auto mt-7 flex max-w-lg items-center gap-2 rounded-2xl glass px-4 py-3">
            <Search className="h-4 w-4 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>
        </motion.div>

        <div className="mt-12 space-y-10">
          {cats.length === 0 && (
            <p className="text-center text-sm text-white/60">
              No results. Try a different keyword.
            </p>
          )}
          {cats.map((cat) => (
            <div key={cat}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                {cat}
              </h2>
              <div className="space-y-3">
                {filtered
                  .filter((f) => f.cat === cat)
                  .map((f) => {
                    const idx = FAQS.indexOf(f);
                    const open = openIdx === idx;
                    return (
                      <motion.div key={f.q} layout className="glass overflow-hidden rounded-2xl">
                        <button
                          onClick={() => setOpenIdx(open ? null : idx)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <span className="text-sm font-semibold sm:text-base">{f.q}</span>
                          <motion.span
                            animate={{ rotate: open ? 45 : 0 }}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-white/80"
                          >
                            <Plus className="h-4 w-4" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-5 text-sm leading-relaxed text-white/70">
                                {f.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-primary p-8 text-center glow-purple sm:p-12">
          <h3 className="text-2xl font-black text-white sm:text-3xl">Still stuck?</h3>
          <p className="mt-2 text-white/85">Our team gets back within 24 hours.</p>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-black/40 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-transform hover:scale-[1.03]"
          >
            Contact support
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
