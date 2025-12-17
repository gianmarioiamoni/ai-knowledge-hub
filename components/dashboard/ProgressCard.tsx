import { JSX } from "react";

type ProgressCardProps = {
  title: string;
  subtitle: string;
  progress: number; // 0-100
  syncedLabel: string;
};

function ProgressCard({
  title,
  subtitle,
  progress,
  syncedLabel,
}: ProgressCardProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/30 bg-white/70 px-5 py-4 text-sm shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_10px_50px_-25px_rgba(79,70,229,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{subtitle}</span>
        <span className="font-semibold text-foreground">{syncedLabel}</span>
      </div>
    </div>
  );
}

export { ProgressCard };

