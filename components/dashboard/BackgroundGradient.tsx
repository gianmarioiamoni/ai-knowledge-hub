import type { JSX } from "react";

type BackgroundGradientProps = {
  className?: string;
};

export function BackgroundGradient({ className = "" }: BackgroundGradientProps): JSX.Element {
  return (
    <div className={`pointer-events-none absolute inset-0 opacity-70 ${className}`}>
      <div className="absolute -left-28 -top-32 h-[36rem] w-[36rem] rounded-full bg-primary/18 blur-[120px]" />
      <div className="absolute right-[-18rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-accent/18 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-[size:44px_44px] mix-blend-screen dark:opacity-20" />
    </div>
  );
}

