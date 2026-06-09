import type { ReactNode } from "react";
import { BackgroundFX } from "./BackgroundFX";
import { BottomNav } from "./BottomNav";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Settings, Home, Receipt, Wallet, Target, BarChart3, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./Logo";

const sideItems = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/expenses", label: "Expenses", Icon: Receipt },
  { to: "/budget", label: "Budget", Icon: Wallet },
  { to: "/savings", label: "Savings", Icon: Target },
  { to: "/insights", label: "Insights", Icon: BarChart3 },
] as const;

export function AppShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();

  return (
    <div className="relative min-h-screen text-foreground">
      <BackgroundFX />

      {/* ───── Desktop sidebar ───── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-background/40 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link to="/home" className="mb-8 px-2">
          <Logo />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {sideItems.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-primary opacity-90 glow-purple"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
          <Link
            to="/alerts"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-5 w-5" /> Alerts
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-5 w-5" /> Settings
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ───── Mobile top header ───── */}
      <header className="sticky top-0 z-30 px-4 pt-4 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl glass px-4 py-2.5">
          <Link to="/home" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary text-sm font-black text-white glow-purple">
              ₦
            </div>
            <div className="text-sm font-semibold tracking-tight">
              Student<span className="text-gradient">Finance+</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/alerts" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </Link>
            <Link to="/settings" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Main content ───── */}
      <main className="mx-auto w-full max-w-md px-4 pt-4 pb-28 lg:ml-64 lg:max-w-none lg:px-8 lg:pt-10 lg:pb-12 xl:px-12">
        <div className="lg:mx-auto lg:max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ───── Mobile bottom nav ───── */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
