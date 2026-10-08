import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const nav = [
  { label: "Features", to: "/" as const, hash: "features" },
  { label: "How it works", to: "/how-it-works" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Contact", to: "/contact" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

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
          {nav.map((n) =>
            n.hash ? (
              <Link
                key={n.label}
                to={n.to}
                hash={n.hash}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {n.label}
              </Link>
            ) : (
              <Link
                key={n.label}
                to={n.to}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                activeProps={{ className: "text-white" }}
              >
                {n.label}
              </Link>
            ),
          )}
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
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-3 rounded-2xl glass-strong p-4 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                hash={n.hash}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/10" />
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
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
