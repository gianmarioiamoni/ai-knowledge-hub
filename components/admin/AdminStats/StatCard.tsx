import type { JSX } from "react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps): JSX.Element {
  return (
    <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold text-foreground">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}

