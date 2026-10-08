import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { UserPlus, Sliders, Receipt, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TiltCard } from "@/components/TiltCard";
import heroPhone from "@/assets/hero-phone.jpg";
import students from "@/assets/students.jpg";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — StudentFinance+" },
      {
        name: "description",
        content:
          "A 4-step walkthrough of StudentFinance+: sign up, set your split, log expenses, and stay on track all month.",
      },
      { property: "og:title", content: "How StudentFinance+ works" },
      {
        property: "og:description",
        content: "Set up a smart budget in under a minute. See exactly how.",
      },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const steps = [
    {
      n: "01",
      Icon: UserPlus,
      t: "Sign up free",
      d: "Create your account in 30 seconds. Just your email, allowance amount, and you're in. No bank required.",
      tint: "from-neon-purple to-neon-pink",
    },
    {
      n: "02",
      Icon: Sliders,
      t: "Set your split",
      d: "We suggest 60/20/20 (Needs / Wants / Savings) — adjust to match your reality. Drag sliders, done.",
      tint: "from-neon-cyan to-neon-purple",
    },
    {
      n: "03",
      Icon: Receipt,
      t: "Log spends in 3 taps",
      d: "Amount → Category → Save. Track every ₦100 jollof or sachet water without breaking your flow.",
      tint: "from-neon-amber to-neon-pink",
    },
    {
      n: "04",
      Icon: TrendingUp,
      t: "Stay on track",
      d: "Smart overspend alerts, weekly streaks, and insights show exactly where your money goes.",
      tint: "from-neon-green to-neon-cyan",
    },
  ];

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-neon-amber" /> Built for Nigerian uni life
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            How <span className="text-gradient">StudentFinance+</span> works
          </h1>
          <p className="mt-4 text-base text-white/70">
            Four steps. Zero finance jargon. Designed for the way you actually live and spend.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08 }}
            >
              <TiltCard className="rounded-3xl" max={10}>
                <div className="glass relative h-full rounded-3xl p-6">
                  <div className="absolute right-5 top-5 text-3xl font-black text-white/10">
                    {s.n}
                  </div>
                  <div
                    className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.tint} glow-purple`}
                  >
                    <s.Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{s.t}</h3>
                  <p className="mt-2 text-sm text-white/65">{s.d}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Showcase */}
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              A finance app that <span className="text-gradient">speaks your language</span>
            </h2>
            <p className="mt-4 text-white/70">
              StudentFinance+ understands cash spending, market jargon, and the realities of student
              life in Nigeria. From bolt rides to suya stops, every naira is tracked the way you
              actually spend.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/85">
              {[
                "Works offline — sync later",
                "Scan receipts with your camera",
                "Friendly nudges before you overspend",
                "Confetti when you crush a savings goal",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-neon-green/20 text-neon-green">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white glow-purple transition-transform hover:scale-[1.03]"
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <TiltCard className="rounded-[2rem]" max={12}>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-primary opacity-25 blur-3xl" />
              <img
                src={heroPhone}
                alt="StudentFinance+ on a phone"
                className="w-full rounded-[2rem] border border-white/10 shadow-2xl"
              />
            </div>
          </TiltCard>
        </div>

        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <TiltCard className="rounded-[2rem] lg:order-2" max={12}>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-accent opacity-25 blur-3xl" />
              <img
                src={students}
                alt="Nigerian students using StudentFinance+"
                className="w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl"
              />
            </div>
          </TiltCard>
          <div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Made <span className="text-gradient">with students</span>, for students.
            </h2>
            <p className="mt-4 text-white/70">
              We co-designed StudentFinance+ with hundreds of students from FUNAAB, UNILAG, OAU, UI,
              and ABU. Every feature exists because a real student asked for it.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
