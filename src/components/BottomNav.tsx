import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Receipt, Wallet, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/expenses", label: "Expenses", Icon: Receipt },
  { to: "/budget", label: "Budget", Icon: Wallet },
  { to: "/savings", label: "Savings", Icon: Target },
  { to: "/insights", label: "Insights", Icon: BarChart3 },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-3xl glass-strong px-2 py-2">
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className="relative flex-1 py-2"
              aria-label={label}
            >
              <div className="flex flex-col items-center gap-0.5">
                {active && (
                  <motion.div
                    layoutId="bnav-pill"
                    className="absolute inset-1 rounded-2xl bg-gradient-primary opacity-90 glow-purple"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5 transition-colors",
                    active ? "text-white" : "text-white/70",
                  )}
                />
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-medium tracking-wide",
                    active ? "text-white" : "text-white/60",
                  )}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
