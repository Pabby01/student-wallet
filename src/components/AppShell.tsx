import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BackgroundFX } from "./BackgroundFX";
import { BottomNav } from "./BottomNav";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Settings,
  Home,
  Receipt,
  Wallet,
  Target,
  BarChart3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
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

const STORAGE_KEY = "sf_sidebar_collapsed_v1";

export function AppShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {
      /* localStorage unavailable (private browsing) */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* localStorage unavailable (private browsing) */
    }
  }, [collapsed]);

  const sideW = collapsed ? "lg:w-20" : "lg:w-64";

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground lg:flex lg:items-stretch">
      <BackgroundFX />

      {/* ───── Desktop sidebar ───── */}
      <aside
        className={cn(
          "z-30 hidden flex-col border-r border-white/10 bg-background/50 px-3 py-5 backdrop-blur-xl transition-[width] duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0",
          sideW,
        )}
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <Link to="/home" className={cn("flex items-center", collapsed && "mx-auto")}>
            {collapsed ? (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-sm font-black text-white glow-purple">
                ₦
              </div>
            ) : (
              <Logo />
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mb-3 grid h-9 w-full place-items-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <nav className="flex flex-1 flex-col gap-1">
          {sideItems.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
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
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                {!collapsed && <span className="relative z-10">{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
          <Link
            to="/alerts"
            title={collapsed ? "Alerts" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            <Bell className="h-5 w-5 shrink-0" /> {!collapsed && "Alerts"}
          </Link>
          <Link
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" /> {!collapsed && "Settings"}
          </Link>
          <button
            onClick={signOut}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" /> {!collapsed && "Sign out"}
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
            <Link
              to="/alerts"
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <Link
              to="/settings"
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Main content ───── */}
      <main
        className={cn(
          "mx-auto w-full max-w-md px-4 pt-4 pb-28 lg:flex-1 lg:min-w-0 lg:max-w-none lg:px-8 lg:pt-10 lg:pb-12 xl:px-12",
        )}
      >
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
