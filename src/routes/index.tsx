import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Wallet,
  Receipt,
  Target,
  BarChart3,
  Bell,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Twitter,
  Instagram,
  Github,
  Star,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import heroPhone from "@/assets/hero-phone.jpg";
import students from "@/assets/students.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentFinance+ — Smart budgets for Nigerian students" },
      {
        name: "description",
        content:
          "Cash-first expense tracker, AI alerts, and savings goals built for Nigerian university students. Stop running out of money before month-end.",
      },
      { property: "og:title", content: "StudentFinance+ — Smart budgets for students" },
      { property: "og:description", content: "Crush savings goals and dodge broke weeks. Built for Nigerian uni life." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/home" });
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <LogoMarquee />
      <Features />
      <ShowcaseParallax />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ───────────────────── Header ───────────────────── */
function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const nav = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "backdrop-blur-xl bg-background/60 border-b border-white/10" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/auth"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white glow-purple transition-transform hover:scale-[1.03]"
          >
            Get started
          </Link>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl glass md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-3 rounded-2xl glass-strong p-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
              >
                {n.label}
              </a>
            ))}
            <div className="my-1 h-px bg-white/10" />
            <Link
              to="/auth"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl bg-gradient-primary px-4 py-2.5 text-center text-sm font-semibold text-white glow-purple"
            >
              Get started
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

/* ───────────────────── Hero with 3D parallax ───────────────────── */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yPhone = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const rotPhone = useTransform(scrollYProgress, [0, 1], [-8, reduce ? -8 : 8]);
  const scalePhone = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.92]);
  const yBack = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);

  // mouse parallax
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const sx = useSpring(mouse.x, { stiffness: 60, damping: 20 });
  const sy = useSpring(mouse.y, { stiffness: 60, damping: 20 });

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width - 0.5) * 20,
      y: ((e.clientY - r.top) / r.height - 0.5) * 20,
    });
  }

  return (
    <section ref={ref} onMouseMove={onMove} className="relative pt-32 pb-16 sm:pt-36 sm:pb-24">
      {/* glow blobs */}
      <motion.div style={{ y: yBack }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/40 blur-3xl animate-float-slow" />
        <div
          className="absolute top-1/2 -right-32 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-neon-pink/30 blur-3xl animate-float-slow"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute -bottom-32 left-1/3 h-[28rem] w-[28rem] rounded-full bg-neon-cyan/25 blur-3xl animate-float-slow"
          style={{ animationDelay: "-8s" }}
        />
      </motion.div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-white/80"
          >
            <Sparkles className="h-3.5 w-3.5 text-neon-amber" /> Built for Nigerian university students
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Stop running out of <span className="text-gradient">money</span> before month-end.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-xl text-base text-white/70 sm:text-lg"
          >
            StudentFinance+ tracks your cash spending, splits your allowance into smart budgets, and pings
            you before you overspend. No bank login. No stress.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-white glow-purple transition-transform hover:scale-[1.03]"
            >
              Start free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="rounded-2xl glass px-6 py-3.5 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              See how it works
            </a>
          </motion.div>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-neon-green" /> No bank login required
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-neon-cyan" /> Works on any Android phone
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-neon-amber" /> Free for students
            </div>
          </div>
        </div>

        {/* 3D Phone */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none" style={{ perspective: 1200 }}>
          <motion.div
            style={{
              y: yPhone,
              rotate: rotPhone,
              scale: scalePhone,
              x: sx,
              rotateY: useTransform(sx, (v) => v * 0.6),
              rotateX: useTransform(sy, (v) => -v * 0.6),
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-primary opacity-30 blur-3xl" />
            <img
              src={heroPhone}
              alt="StudentFinance+ app on a phone"
              width={1024}
              height={1024}
              className="mx-auto w-full max-w-[520px] rounded-[2rem] shadow-[0_40px_120px_-20px_rgba(139,92,246,0.55)]"
            />
            {/* Floating chips */}
            <FloatingChip
              className="left-0 top-10"
              icon={<Wallet className="h-4 w-4 text-neon-green" />}
              label="₦12,400 saved this week"
              delay={0.4}
            />
            <FloatingChip
              className="right-0 top-1/3"
              icon={<Bell className="h-4 w-4 text-neon-amber" />}
              label="80% of Wants used"
              delay={0.7}
            />
            <FloatingChip
              className="bottom-6 left-6"
              icon={<Target className="h-4 w-4 text-neon-cyan" />}
              label="Goal: Laptop 64%"
              delay={1}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingChip({
  className,
  icon,
  label,
  delay = 0,
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 20 }}
      className={`absolute hidden items-center gap-2 rounded-2xl glass-strong px-3 py-2 text-xs font-semibold text-white shadow-xl sm:flex ${className}`}
    >
      {icon}
      {label}
    </motion.div>
  );
}

/* ───────────────────── Trust marquee ───────────────────── */
function LogoMarquee() {
  const schools = ["FUNAAB", "UNILAG", "UI", "OAU", "UNN", "ABU", "Covenant", "Babcock"];
  return (
    <section className="border-y border-white/10 bg-white/[0.02] py-6">
      <p className="px-4 text-center text-xs font-medium uppercase tracking-widest text-white/40">
        Trusted by students at
      </p>
      <div className="mt-3 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="flex w-max gap-12 whitespace-nowrap px-6 text-base font-bold text-white/50"
        >
          {[...schools, ...schools, ...schools].map((s, i) => (
            <span key={i} className="tracking-wider">
              {s}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Features ───────────────────── */
function Features() {
  const items = [
    {
      icon: Receipt,
      title: "Cash-first tracking",
      body: "Log every ₦100 jollof and ₦50 sachet water in seconds. Scan receipts with your camera.",
      tint: "from-neon-purple to-neon-pink",
    },
    {
      icon: Wallet,
      title: "Smart 60/20/20 budgets",
      body: "Auto-split your allowance into Needs, Wants, Savings. Customize anytime.",
      tint: "from-neon-cyan to-neon-purple",
    },
    {
      icon: Bell,
      title: "Overspend alerts",
      body: "Get a friendly nudge before you blow your week's food money on shawarma.",
      tint: "from-neon-amber to-neon-pink",
    },
    {
      icon: Target,
      title: "Savings goals + confetti",
      body: "Save for a laptop, hostel rent, or trip home. Celebrate every milestone 🎉",
      tint: "from-neon-green to-neon-cyan",
    },
    {
      icon: BarChart3,
      title: "Insights that don't suck",
      body: "Daily spend chart, category donuts, weekly streaks. Spot leaks fast.",
      tint: "from-neon-pink to-neon-amber",
    },
    {
      icon: ShieldCheck,
      title: "Private by default",
      body: "Your data stays yours. No bank linking, no shady ad networks, ever.",
      tint: "from-neon-purple to-neon-cyan",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Everything you need to <span className="text-gradient">crush school finances</span>
        </h2>
        <p className="mt-4 text-base text-white/70">
          Designed with real Nigerian uni students. Built for the cash economy. No fluff, no bank logins.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group glass relative overflow-hidden rounded-3xl p-6 transition-shadow hover:shadow-[0_30px_80px_-20px_rgba(139,92,246,0.45)]"
            >
              <div
                className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${it.tint} glow-purple`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">{it.title}</h3>
              <p className="mt-2 text-sm text-white/65">{it.body}</p>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────── Scroll Showcase (3D depth) ───────────────────── */
function ShowcaseParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  return (
    <section ref={ref} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div style={{ y: y1 }}>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Made for the way <span className="text-gradient">you actually live</span>
          </h2>
          <p className="mt-4 text-white/70">
            Whether you're at FUNAAB lecture hall, the market in Akure, or back home in Lagos — log a spend
            in 3 taps. Your dashboard updates instantly with insights that actually help.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            {[
              "Works offline — sync later",
              "Voice-add expenses (coming soon)",
              "Roommate splits & shared budgets",
              "Export to CSV for your records",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-neon-green/20 text-neon-green">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div style={{ y: y2, rotate: rot }} className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-accent opacity-25 blur-3xl" />
          <img
            src={students}
            alt="Nigerian students using StudentFinance+"
            loading="lazy"
            className="w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── How It Works ───────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Sign up free", d: "Enter your monthly allowance. Takes 30 seconds." },
    { n: "02", t: "Set your split", d: "We suggest 60/20/20. Tweak to match your reality." },
    { n: "03", t: "Log spends in 3 taps", d: "Amount → Category → Save. Done." },
    { n: "04", t: "Stay on track", d: "Smart alerts + weekly insights keep you ahead." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Get started in <span className="text-gradient">under a minute</span>
        </h2>
      </div>
      <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-sm font-black text-white glow-purple">
              {s.n}
            </div>
            <div className="mt-5 text-center">
              <h3 className="text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-white/65">{s.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── Testimonials ───────────────────── */
function Testimonials() {
  const cards = [
    {
      n: "Adaeze O.",
      r: "300L, UNILAG",
      t: "I used to be broke by week 3. Now I actually save ₦20k every month. Game changer 💜",
    },
    {
      n: "Tunde A.",
      r: "200L, FUNAAB",
      t: "The overspend alerts are SO clutch. Saved me from blowing my food money on shawarma twice.",
    },
    {
      n: "Halima M.",
      r: "400L, ABU",
      t: "Finally a finance app that gets cash spending. I scanned my market receipt and it just worked.",
    },
  ];
  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Loved by students <span className="text-gradient">across Nigeria</span>
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.n}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-3xl p-6"
          >
            <div className="flex gap-0.5 text-neon-amber">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/85">"{c.t}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                {c.n[0]}
              </div>
              <div>
                <div className="text-sm font-semibold">{c.n}</div>
                <div className="text-xs text-white/55">{c.r}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div id="faq" className="mx-auto mt-20 max-w-3xl">
        <h3 className="text-center text-2xl font-bold sm:text-3xl">Quick questions</h3>
        <div className="mt-8 space-y-3">
          {[
            ["Is it really free?", "Yes — completely free for students. We may add optional premium features later."],
            ["Do I have to link my bank?", "Nope. StudentFinance+ is cash-first. You can use it without any bank account."],
            ["Does it work offline?", "Yes. Add expenses without internet; they sync when you reconnect."],
            ["Is my data safe?", "Your data is encrypted and only visible to you. We never sell it."],
          ].map(([q, a]) => (
            <details key={q} className="group glass rounded-2xl px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold">
                <div className="flex items-center justify-between">
                  {q}
                  <span className="text-white/50 transition-transform group-open:rotate-45">+</span>
                </div>
              </summary>
              <p className="mt-2 text-sm text-white/70">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Final CTA ───────────────────── */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary p-10 text-center glow-purple sm:p-16">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-neon-cyan blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-neon-amber blur-3xl" />
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-3xl font-black text-white sm:text-5xl"
        >
          Your future self will thank you.
        </motion.h2>
        <p className="relative mx-auto mt-3 max-w-xl text-white/85">
          Join thousands of Nigerian students saving smarter every month. It's free, fast, and built for you.
        </p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-2 rounded-2xl bg-black/40 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-transform hover:scale-[1.03]"
          >
            Create my free account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-purple-700 transition-transform hover:scale-[1.03]"
          >
            I already have one
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Footer ───────────────────── */
function SiteFooter() {
  const cols = [
    {
      h: "Product",
      l: [
        ["Features", "#features"],
        ["How it works", "#how"],
        ["Reviews", "#reviews"],
        ["FAQ", "#faq"],
      ],
    },
    {
      h: "Company",
      l: [
        ["About", "#"],
        ["Blog", "#"],
        ["Careers", "#"],
        ["Press", "#"],
      ],
    },
    {
      h: "Legal",
      l: [
        ["Privacy", "#"],
        ["Terms", "#"],
        ["Security", "#"],
        ["Contact", "#"],
      ],
    },
  ];
  return (
    <footer className="border-t border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Smart budgets, cash-first tracking, and savings goals for Nigerian university students.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Instagram, Github].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl glass hover:bg-white/10"
                  aria-label="social"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="text-xs font-bold uppercase tracking-wider text-white/50">{c.h}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {c.l.map(([t, h]) => (
                  <li key={t}>
                    <a href={h} className="text-white/75 hover:text-white">
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} StudentFinance+. Built with 💜 in Naija.</p>
          <p>Made for Nigerian students. By students.</p>
        </div>
      </div>
    </footer>
  );
}
