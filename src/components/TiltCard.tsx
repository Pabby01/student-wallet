import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 3D tilt-on-hover wrapper. Use around images/cards for a Framer-style effect.
 */
export function TiltCard({
  children,
  className,
  max = 14,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const rotX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: 1000 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={cn("relative will-change-transform", className)}
    >
      <div style={{ transform: "translateZ(40px)" }} className="relative">
        {children}
        {glare && (
          <motion.div
            aria-hidden
            style={{
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.35), transparent 55%)`,
              backgroundPositionX: glareX,
              backgroundPositionY: glareY,
            }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 hover:opacity-100 mix-blend-overlay"
          />
        )}
      </div>
    </motion.div>
  );
}
