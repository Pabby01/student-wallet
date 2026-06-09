import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/30 blur-3xl animate-float-slow" />
        <div
          className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-neon-pink/25 blur-3xl animate-float-slow"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute -bottom-32 left-1/3 h-[24rem] w-[24rem] rounded-full bg-neon-cyan/20 blur-3xl animate-float-slow"
          style={{ animationDelay: "-9s" }}
        />
      </div>
      <SiteHeader />
      <main className="pt-24">{children}</main>
      <SiteFooter />
    </div>
  );
}
