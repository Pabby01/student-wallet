// Subtle animated background — floating blurred blobs + grid overlay.
export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-purple/40 blur-3xl animate-float-slow" />
      <div
        className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-neon-pink/30 blur-3xl animate-float-slow"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-neon-cyan/30 blur-3xl animate-float-slow"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}
