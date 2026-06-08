import type { ReactNode } from "react";
import { BackgroundFX } from "./BackgroundFX";
import { BottomNav } from "./BottomNav";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="relative min-h-screen text-foreground">
      <BackgroundFX />
      <header className="sticky top-0 z-30 px-4 pt-4">
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
      <main className="mx-auto w-full max-w-md px-4 pt-4 pb-28">
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
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
