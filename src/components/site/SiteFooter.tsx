import { Link } from "@tanstack/react-router";
import { Twitter, Instagram, Github } from "lucide-react";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  const cols: { h: string; l: Array<[string, string]> }[] = [
    {
      h: "Product",
      l: [
        ["Features", "/"],
        ["How it works", "/how-it-works"],
        ["FAQ", "/faq"],
        ["Contact", "/contact"],
      ],
    },
    {
      h: "Company",
      l: [
        ["About", "/how-it-works"],
        ["FAQ", "/faq"],
        ["Contact us", "/contact"],
      ],
    },
    {
      h: "Account",
      l: [
        ["Log in", "/auth"],
        ["Create account", "/auth"],
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
              Smart budgets, cash-first tracking, and savings goals for Nigerian university
              students.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Instagram, Github].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl glass transition-transform hover:-translate-y-0.5 hover:bg-white/10"
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
                    <Link to={h} className="text-white/75 hover:text-white">
                      {t}
                    </Link>
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
