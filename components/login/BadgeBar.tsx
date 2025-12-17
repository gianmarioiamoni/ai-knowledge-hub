import { JSX } from "react";
import { ShieldCheck } from "lucide-react";

type BadgeBarProps = {
  hint: string;
};

function BadgeBar({ hint }: BadgeBarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur dark:bg-white/10">
        <ShieldCheck className="size-4 text-primary" />
        Multi-tenant RAG protetto
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_6px_rgba(79,70,229,0.15)]" />
        {hint}
      </div>
    </div>
  );
}

export { BadgeBar };

