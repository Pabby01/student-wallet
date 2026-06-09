import { cn } from "@/lib/utils";

export function Logo({
  className,
  withText = true,
  size = "md",
}: {
  className?: string;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "sm" ? "h-8 w-8 text-base" : size === "lg" ? "h-14 w-14 text-2xl" : "h-10 w-10 text-lg";
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-2xl bg-gradient-primary font-black text-white glow-purple ring-1 ring-white/20",
          dims,
        )}
      >
        ₦
      </div>
      {withText && (
        <span className={cn("font-extrabold tracking-tight", text)}>
          Student<span className="text-gradient">Finance+</span>
        </span>
      )}
    </div>
  );
}
