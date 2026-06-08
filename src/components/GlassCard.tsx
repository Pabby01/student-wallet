import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = HTMLMotionProps<"div"> & { children: ReactNode; strong?: boolean };

export function GlassCard({ children, className, strong, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-3xl p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
