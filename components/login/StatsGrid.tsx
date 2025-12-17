import { JSX } from "react";

type Stat = {
  label: string;
  value: string;
  hint: string;
};

type StatsGridProps = {
  stats: Stat[];
};

function StatsGrid({ stats }: StatsGridProps): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

export type { Stat };
export { StatsGrid };

