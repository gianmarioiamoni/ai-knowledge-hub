import { JSX } from "react";
import { ShieldCheck } from "lucide-react";

type Pill = { label: string };

type BadgePillsProps = {
  badgeLabel?: string;
  showBadge?: boolean;
  showTitle?: boolean;
  title: string;
  headline: string;
  subtitle: string;
  pills: Pill[];
};

function BadgePills({
  badgeLabel,
  showBadge = true,
  showTitle = true,
  title,
  headline,
  subtitle,
  pills,
}: BadgePillsProps): JSX.Element {
  return (
    <div className="space-y-3">
      {badgeLabel && showBadge ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur dark:bg-white/10">
          <ShieldCheck className="size-4 text-primary" />
          {badgeLabel}
        </div>
      ) : null}
      <div className="space-y-2">
        {showTitle ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{title}</p>
        ) : null}
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{headline}</h1>
        <p className="max-w-3xl text-base text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary ring-1 ring-primary/30"
          >
            <span className="size-2 rounded-full bg-primary" />
            {pill.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export type { Pill };
export { BadgePills };

